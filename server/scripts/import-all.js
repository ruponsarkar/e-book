// Imports (or re-syncs) every book under content/.
//
// Usage: npm run import-all                 (uses ./content)
//        npm run import-all -- path/to/dir  (any folder of book folders)
//
// Every subfolder with a book.json is imported, the same way import-book does it.
// All folders are read and checked first; if any of them has a problem, nothing is
// written, so a broken file can't leave the library half-updated.
// Books in the database that no longer have a folder are listed but not deleted.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../src/config');
const { Book } = require('../src/models/Book');
const { readBook, saveBook } = require('./import-book');

async function main() {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'content'));
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'book.json')))
    .map((d) => path.join(root, d.name))
    .sort();
  if (dirs.length === 0) throw new Error(`No book folders (with a book.json) found in ${root}`);

  const books = [];
  const problems = [];
  for (const dir of dirs) {
    try {
      books.push(readBook(dir));
    } catch (err) {
      problems.push(`  ${path.basename(dir)}: ${err.message}`);
    }
  }
  const seen = new Map();
  for (const b of books) {
    if (seen.has(b.meta.slug)) problems.push(`  slug "${b.meta.slug}" is used by more than one folder`);
    seen.set(b.meta.slug, true);
  }
  if (problems.length) {
    console.error(`Nothing imported. Fix these first:\n${problems.join('\n')}`);
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);
  try {
    for (const book of books) {
      await saveBook(book, { verbose: false });
      console.log(`✔ ${book.meta.slug.padEnd(24)} ${String(book.sections.length).padStart(3)} sections  ${book.meta.title}`);
    }
    const orphans = await Book.find({ slug: { $nin: [...seen.keys()] } }).lean();
    if (orphans.length) {
      console.log(`\nIn the database but not in ${path.relative(process.cwd(), root) || root} (left untouched):`);
      for (const b of orphans) console.log(`  ${b.slug}`);
    }
    console.log(`\n${books.length} book(s) synced.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
