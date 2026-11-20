// Give a user access to books (keeps the books they already have).
// Usage:
//   npm run grant-books -- student@example.com general-english social-studies
//   npm run grant-books -- student@example.com --all          (every published book)
//   npm run grant-books -- --list                             (show books and who can read them)
const mongoose = require('mongoose');
const config = require('../src/config');
const User = require('../src/models/User');
const { Book } = require('../src/models/Book');

const USAGE = 'Usage: npm run grant-books -- <email> <book-slug...> | <email> --all | --list';

async function list() {
  const books = await Book.find().sort({ slug: 1 }).lean();
  console.log('Books:');
  for (const b of books) console.log(`  ${b.slug}${b.published ? '' : '  (unpublished)'}`);
  const users = await User.find({ role: { $ne: 'admin' } }).sort({ email: 1 }).lean();
  console.log('\nStudents:');
  for (const u of users) console.log(`  ${u.email}: ${u.books.length ? u.books.join(', ') : '(no books)'}`);
}

async function grant(email, args) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error(`No user with email ${email}. Create the account first.`);

  let slugs;
  if (args.includes('--all')) {
    slugs = (await Book.find({ published: true }).lean()).map((b) => b.slug);
  } else {
    const found = new Set((await Book.find({ slug: { $in: args } }).lean()).map((b) => b.slug));
    const missing = args.filter((s) => !found.has(s));
    if (missing.length) throw new Error(`Unknown book slug(s): ${missing.join(', ')}. Run with --list to see them.`);
    slugs = args;
  }

  const added = slugs.filter((s) => !user.books.includes(s));
  user.books = [...user.books, ...added];
  await user.save();
  console.log(added.length ? `Added: ${added.join(', ')}` : 'Nothing new to add.');
  console.log(`${user.email} can now read: ${user.books.join(', ')}`);
}

async function main() {
  const [first, ...rest] = process.argv.slice(2);
  if (!first || (first !== '--list' && !rest.length)) {
    console.error(USAGE);
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  try {
    if (first === '--list') await list();
    else await grant(first, rest);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
