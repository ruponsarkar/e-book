// Talks to the API server (same origin as the panel).
const TOKEN = 'admin.token';

export const auth = {
  get token() {
    try {
      return localStorage.getItem(TOKEN);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN, token);
      else localStorage.removeItem(TOKEN);
    } catch {
      // private mode: stays signed in for this tab only
    }
  },
};

let onSignedOut = () => {};
export const setSignedOutHandler = (fn) => (onSignedOut = fn);

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth.token) {
    auth.set(null);
    onSignedOut(data.message);
  }
  if (!res.ok) throw Object.assign(new Error(data.message || `Error ${res.status}`), { status: res.status });
  return data;
}
