// Imports one book from a folder of Markdown files.
//
// Usage: npm run import-book -- content/assam-gk
//
// The folder must contain:
//   book.json   { "slug": "assam-gk", "title": "...", "subtitle": "...", "edition": "..." }
//   *.md        one file per tab, exported from the doc (Export → Markdown).
//               Files are read in name order, so prefix them: 00-front-matter.md,
//               01-chapter-1.md, 02-chapter-2.md, 90-test-paper-1.md ...
//
// The section title is the first "# " heading in each file. Re-running the import
// replaces the book's sections, so you can fix a chapter and import again.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../src/config');
const { Book, Section } = require('../src/models/Book');

function kindFor(fileName) {
  const n = fileName.toLowerCase();
  if (n.includes('front')) return 'front';
  if (n.includes('test') || n.includes('mock')) return 'test';
  return 'chapter';
}

// Reads and checks a book folder without touching the database.
function readBook(dir) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'book.json'), 'utf8'));
  if (!meta.slug || !meta.title) throw new Error(`${dir}/book.json needs at least "slug" and "title".`);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  if (files.length === 0) throw new Error(`No .md files found in ${dir}`);

  const sections = files.map((file, i) => {
    const markdown = fs.readFileSync(path.join(dir, file), 'utf8');
    const heading = markdown.match(/^#\s+(.+)$/m);
    const title = heading ? heading[1].trim() : path.basename(file, '.md');
    const key = path.basename(file, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { file, bookSlug: meta.slug, order: i, key, title, kind: kindFor(file), markdown };
  });
  return { meta, sections };
}

// Writes a book read by readBook(). Expects an open mongoose connection.
async function saveBook({ meta, sections }, { verbose = true } = {}) {
  await Book.updateOne({ slug: meta.slug }, { $set: { ...meta, published: meta.published !== false } }, { upsert: true });
  await Section.deleteMany({ bookSlug: meta.slug });
  await Section.insertMany(sections.map(({ file, ...s }) => s));
  if (verbose) for (const s of sections) console.log(`  imported ${s.file} → "${s.title}"`);
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: npm run import-book -- <folder>');
    process.exit(1);
  }
  const book = readBook(dir);
  await mongoose.connect(config.mongoUri);
  await saveBook(book);
  console.log(`Book "${book.meta.title}" imported with ${book.sections.length} sections.`);
  await mongoose.disconnect();
}

module.exports = { readBook, saveBook };

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
