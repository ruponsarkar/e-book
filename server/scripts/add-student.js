// Create a student account and give it books in one step.
// Usage:
//   npm run add-student -- student@example.com "Pass12345"                       (no books yet)
//   npm run add-student -- student@example.com "Pass12345" --all                 (every published book)
//   npm run add-student -- student@example.com "Pass12345" assam-gk general-english
//   npm run add-student -- student@example.com "Pass12345" --all --name "Rahul Das"
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config');
const User = require('../src/models/User');
const { Book } = require('../src/models/Book');

const USAGE =
  'Usage: npm run add-student -- <email> <password (8+ characters)> [--all | <book-slug...>] [--name "Full Name"]';

function parseArgs(argv) {
  const [email, password, ...rest] = argv;
  let name = '';
  const slugs = [];
  let all = false;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--name') name = rest[++i] || '';
    else if (rest[i] === '--all') all = true;
    else slugs.push(rest[i]);
  }
  return { email, password, name, slugs, all };
}

async function main() {
  const { email, password, name, slugs, all } = parseArgs(process.argv.slice(2));
  if (!email || !email.includes('@') || !password || password.length < 8) {
    console.error(USAGE);
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  try {
    const address = email.toLowerCase().trim();
    if (await User.exists({ email: address })) {
      throw new Error(`${address} already has an account. To give it more books: npm run grant-books -- ${address} --all`);
    }

    let books = [];
    if (all) {
      books = (await Book.find({ published: true }).sort({ slug: 1 }).lean()).map((b) => b.slug);
    } else if (slugs.length) {
      const found = new Set((await Book.find({ slug: { $in: slugs } }).lean()).map((b) => b.slug));
      const missing = slugs.filter((s) => !found.has(s));
      if (missing.length) {
        throw new Error(`Unknown book slug(s): ${missing.join(', ')}. See them with: npm run grant-books -- --list`);
      }
      books = slugs;
    }

    await User.create({ name, email: address, books, role: 'student', passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Student account created: ${address}${name ? ` (${name})` : ''}`);
    console.log(books.length ? `Can read: ${books.join(', ')}` : 'No books yet. Add some with: npm run grant-books -- ' + address + ' --all');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
