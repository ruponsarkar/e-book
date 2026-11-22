const crypto = require('crypto');
const { parseTestKey } = require('./testKey');

const hashOf = (markdown) => crypto.createHash('sha256').update(markdown).digest('hex').slice(0, 16);

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// Quick health report of a section's questions, shown in the admin editor.
function checkSection(markdown, kind) {
  const questions = (markdown.match(/^\*\*\d+\.\*\*/gm) || []).length;
  const report = { questions, answers: null, problems: [] };
  if (!/^#\s+\S/m.test(markdown)) report.problems.push('No "# Title" heading at the top.');
  if (kind === 'test') {
    const { questions: nums, answers } = parseTestKey(markdown);
    report.answers = Object.keys(answers).length;
    if (!report.answers) report.problems.push('No answer key found. Add a "## Answer Key" table: | Q | Answer |.');
    const missing = nums.filter((n) => !answers[n]);
    if (report.answers && missing.length) {
      report.problems.push(`No answer for question${missing.length > 1 ? 's' : ''} ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? '…' : ''}.`);
    }
  }
  return report;
}

module.exports = { hashOf, slugify, checkSection };
