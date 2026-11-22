// Live numbers for the website (published books only), cached for 10 minutes.
const { Book, Section } = require('../models/Book');

let cache = null;
let at = 0;

async function catalog() {
  if (cache && Date.now() - at < 10 * 60 * 1000) return cache;
  const books = await Book.find({ published: true }).sort({ title: 1 }).lean();
  const slugs = books.map((b) => b.slug);
  const sections = await Section.find({ bookSlug: { $in: slugs } }).select('bookSlug kind markdown').lean();
  const per = Object.fromEntries(slugs.map((s) => [s, { chapters: 0, tests: 0, questions: 0 }]));
  const exams = { adre3: 0, adre4: 0, apc: 0, apsi: 0, ssc: 0 };
  for (const s of sections) {
    const p = per[s.bookSlug];
    if (s.kind === 'chapter') p.chapters++;
    if (s.kind === 'test') p.tests++;
    p.questions += (s.markdown.match(/^\*\*\d+\.\*\*/gm) || []).length;
    // Tag lines look like "*B1-C01-0001 · Topic · Easy · ADRE-III-P3, APC, SSC*"
    for (const m of s.markdown.matchAll(/^\*[A-Z0-9]+-[A-Z0-9]+-\d+ · .* · ([^·*]+)\*\s*$/gm)) {
      const tags = m[1].split(',').map((t) => t.trim());
      if (tags.some((t) => t.startsWith('ADRE-III'))) exams.adre3++;
      if (tags.some((t) => t.startsWith('ADRE-IV'))) exams.adre4++;
      if (tags.includes('APC')) exams.apc++;
      if (tags.includes('APSI')) exams.apsi++;
      if (tags.some((t) => t.startsWith('SSC'))) exams.ssc++;
    }
  }
  const list = books.map((b) => {
    const [title, tagline = ''] = b.title.split(/\s+[—–]\s+/);
    const [en, as = ''] = title.split(/\s+\/\s+/);
    return { slug: b.slug, title: en.trim(), assamese: as.trim(), tagline: tagline.split(/\s+\/\s+/)[0].trim(), ...per[b.slug] };
  });
  const sum = (k) => list.reduce((n, b) => n + b[k], 0);
  cache = { books: list, exams, totals: { books: list.length, chapters: sum('chapters'), tests: sum('tests'), questions: sum('questions') } };
  at = Date.now();
  return cache;
}

const clearCatalog = () => {
  cache = null;
};

module.exports = { catalog, clearCatalog };
