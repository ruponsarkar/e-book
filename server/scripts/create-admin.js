// Usage: npm run create-admin -- admin@example.com "StrongPassword123"
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config');
const User = require('../src/models/User');

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error('Usage: npm run create-admin -- <email> <password (8+ characters)>');
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { email: email.toLowerCase(), passwordHash, role: 'admin', disabled: false } },
    { upsert: true }
  );
  console.log(`Admin account ready: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
