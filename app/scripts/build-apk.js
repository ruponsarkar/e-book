// Builds a standalone APK (app code included, no Metro needed) to share with testers.
// Usage: npm run apk      → app/dist/ExamBooks-<version>-<date>.apk
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const android = path.join(root, 'android');
const { version } = require('../app.json').expo;
const apiUrl = require('../app.json').expo.extra?.apiUrl;

if (!fs.existsSync(android)) {
  console.log('No android folder yet, generating it…');
  execSync('npx expo prebuild --platform android', { cwd: root, stdio: 'inherit' });
}

// Remove old outputs so a stale file can never be shared by mistake.
fs.rmSync(path.join(android, 'app/build/outputs/apk'), { recursive: true, force: true });

console.log(`Building release APK (server: ${apiUrl})…`);
execSync('./gradlew assembleRelease', { cwd: android, stdio: 'inherit' });

const built = path.join(android, 'app/build/outputs/apk/release/app-release.apk');
const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
const out = path.join(dist, `ExamBooks-${version}-${stamp}.apk`);
fs.copyFileSync(built, out);

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`\n✔ Ready to share: ${out} (${mb} MB)`);
