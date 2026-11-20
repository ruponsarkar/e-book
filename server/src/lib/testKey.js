// Reads a test paper's questions and answer key straight from its Markdown,
// so the server can grade a submission without trusting the app's score.
//
// Test papers list questions as "**12.** …" and end with a section headed
// "## Answer Key / উত্তৰমালা" holding a table of  | Q | Answer | … |  pairs.

const ANSWER_KEY_HEADING = /^#{1,2}\s+.*(answer key|উত্তৰমালা)/im;

function splitAtKey(markdown) {
  const m = markdown.match(ANSWER_KEY_HEADING);
  if (!m) return { body: markdown, key: '' };
  return { body: markdown.slice(0, m.index), key: markdown.slice(m.index) };
}

function parseTestKey(markdown) {
  const { body, key } = splitAtKey(markdown.replace(/\r\n/g, '\n'));
  const numbers = [...body.matchAll(/^\*\*(\d+)\.\*\*/gm)].map((m) => Number(m[1]));
  const questions = [...new Set(numbers)];

  const answers = {};
  for (const row of key.split('\n')) {
    if (!row.trim().startsWith('|')) continue;
    const cells = row.split('|').map((c) => c.trim());
    for (let c = 0; c < cells.length - 1; c++) {
      const letter = cells[c + 1].match(/^([A-E])(?:\s*\(.*\))?$/); // "C", or "A (True)"
      if (/^\d+$/.test(cells[c]) && letter) answers[Number(cells[c])] = letter[1];
    }
  }
  return { questions, answers };
}

// answers: { "1": "B", "2": "D", … } from the app.
function grade(markdown, given) {
  const { questions, answers } = parseTestKey(markdown);
  let correct = 0;
  let wrong = 0;
  for (const n of questions) {
    const pick = given[String(n)];
    if (!pick) continue;
    if (answers[n] && pick === answers[n]) correct++;
    else wrong++;
  }
  const total = questions.length;
  return { total, correct, wrong, skipped: total - correct - wrong, percent: total ? Math.round((correct / total) * 100) : 0 };
}

// Keeps only "<question number>": "<A–E>" pairs, so stored drafts can't hold anything else.
function cleanAnswers(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) {
    if (/^\d{1,4}$/.test(k) && typeof v === 'string' && /^[A-E]$/.test(v)) out[k] = v;
  }
  return out;
}

module.exports = { parseTestKey, grade, cleanAnswers };
