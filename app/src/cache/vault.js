// Encrypted on-device cache for book content and screen data.
//
// - Every entry is encrypted with XChaCha20-Poly1305 (authenticated, so tampered files are rejected).
// - The 256-bit key is random per install and lives in SecureStore (Android Keystore / iOS Keychain,
//   this device only), never next to the data.
// - File names are keyed hashes, so the folder reveals nothing about which books or chapters it holds.
// - The cache belongs to one account: a different login, a logout, or a session taken over by
//   another phone wipes it (see AuthContext).
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { b64decode, b64encode, utf8decode, utf8encode } from './bytes';

const DIR = `${FileSystem.documentDirectory}vault/`;
const INDEX_FILE = `${DIR}index`;
const KEY_NAME = 'vault.key';
const OWNER_NAME = 'vault.owner';
const SS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const MEMORY_MAX = 40;

let key = null; // Uint8Array(32)
let keyB64 = '';
let owner = null;
let index = {}; // logical key → { f: file name, book, v, t, size }
let ready = false;
const memory = new Map(); // small LRU of decrypted values
let chain = Promise.resolve(); // serialises index writes

// ---- low level -------------------------------------------------------------

function encrypt(value) {
  const nonce = Crypto.getRandomBytes(24);
  const sealed = xchacha20poly1305(key, nonce).encrypt(utf8encode(JSON.stringify(value)));
  const out = new Uint8Array(24 + sealed.length);
  out.set(nonce, 0);
  out.set(sealed, 24);
  return b64encode(out);
}

function decrypt(b64) {
  const all = b64decode(b64);
  const plain = xchacha20poly1305(key, all.subarray(0, 24)).decrypt(all.subarray(24));
  return JSON.parse(utf8decode(plain));
}

async function fileNameFor(k) {
  const h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${keyB64}|${k}`);
  return h.slice(0, 32);
}

async function writeFile(uri, value) {
  await FileSystem.writeAsStringAsync(uri, encrypt(value), { encoding: FileSystem.EncodingType.Base64 });
}

async function readFile(uri) {
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return decrypt(b64);
}

function saveIndex() {
  const snapshot = { ...index };
  chain = chain.then(() => writeFile(INDEX_FILE, snapshot)).catch(() => {});
  return chain;
}

function remember(k, entry) {
  memory.delete(k);
  memory.set(k, entry);
  if (memory.size > MEMORY_MAX) memory.delete(memory.keys().next().value);
}

// ---- public API ------------------------------------------------------------

export const vault = {
  isReady: () => ready,
  owner: () => owner,

  // Opens the cache for this account. A cache that belonged to someone else is wiped first.
  async init(userId) {
    const id = String(userId);
    if (ready && owner === id) return;
    const savedOwner = await SecureStore.getItemAsync(OWNER_NAME, SS);
    if (savedOwner && savedOwner !== id) await this.wipe();

    keyB64 = (await SecureStore.getItemAsync(KEY_NAME, SS)) || '';
    if (!keyB64) {
      await FileSystem.deleteAsync(DIR, { idempotent: true }); // files from a lost key are unreadable anyway
      keyB64 = b64encode(Crypto.getRandomBytes(32));
      await SecureStore.setItemAsync(KEY_NAME, keyB64, SS);
    }
    key = b64decode(keyB64);
    await SecureStore.setItemAsync(OWNER_NAME, id, SS);
    owner = id;

    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
    try {
      index = await readFile(INDEX_FILE);
    } catch {
      index = {};
    }
    ready = true;
  },

  // Who the cache belongs to, without opening it (used when starting offline).
  savedOwner: () => SecureStore.getItemAsync(OWNER_NAME, SS),

  async get(k) {
    if (!ready || !index[k]) return null;
    if (memory.has(k)) {
      const hit = memory.get(k);
      remember(k, hit);
      return hit;
    }
    try {
      const value = await readFile(DIR + index[k].f);
      const entry = { value, v: index[k].v, t: index[k].t };
      remember(k, entry);
      return entry;
    } catch {
      delete index[k]; // missing or tampered: forget it
      saveIndex();
      return null;
    }
  },

  async set(k, value, { book = null, v = null } = {}) {
    if (!ready) return;
    const f = index[k]?.f || (await fileNameFor(k));
    await writeFile(DIR + f, value);
    index[k] = { f, book, v, t: Date.now() };
    remember(k, { value, v, t: index[k].t });
    await saveIndex();
  },

  async remove(k) {
    if (!ready || !index[k]) return;
    const { f } = index[k];
    delete index[k];
    memory.delete(k);
    await FileSystem.deleteAsync(DIR + f, { idempotent: true });
    await saveIndex();
  },

  // True when a saved copy exists (and matches version v, if given).
  has(k, v) {
    const e = ready && index[k];
    return Boolean(e && (v == null || e.v === v));
  },

  // Removes everything saved for books the account can no longer read.
  async pruneBooks(allowed) {
    if (!ready) return;
    const keep = new Set(allowed);
    const gone = Object.keys(index).filter((k) => index[k].book && !keep.has(index[k].book));
    for (const k of gone) await this.remove(k);
  },

  // Logical keys saved for one book.
  keysForBook(slug) {
    return ready ? Object.keys(index).filter((k) => index[k].book === slug) : [];
  },

  async removeBook(slug) {
    if (!ready) return;
    for (const k of Object.keys(index).filter((x) => index[x].book === slug)) await this.remove(k);
  },

  // Deletes every file and the key itself.
  async wipe() {
    ready = false;
    index = {};
    memory.clear();
    key = null;
    keyB64 = '';
    owner = null;
    await chain.catch(() => {});
    await FileSystem.deleteAsync(DIR, { idempotent: true }).catch(() => {});
    await SecureStore.deleteItemAsync(KEY_NAME, SS).catch(() => {});
    await SecureStore.deleteItemAsync(OWNER_NAME, SS).catch(() => {});
  },
};
