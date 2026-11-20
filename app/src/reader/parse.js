// Turns a section's Markdown into blocks the reader can lay out like a printed book.
// Anything that doesn't match a known pattern stays a plain Markdown block, so
// unusual content is never lost — it just renders without the special styling.

const BENGALI = /[ঀ-৿]/;
const OPTION = /^\(([A-E])\)\s*(.*)$/;
const ANSWER = /^\*\*Answer[^:]*:\s*\(([A-E])\)\s*(.*?)\*\*$/;
const TF_ANSWER = /^\*\*Answer[^:]*:\s*(True|False)\b.*\*\*$/i;
const IS_QUESTION = /^\*\*\d+\.\*\*/;
const QUESTION_START = /^\*\*(\d+)\.\*\*\s*(.*)$/;
const EXPLANATION_LABEL = /^(Explanation|Solution|ব্যাখ্যা|সমাধান)\s*:\s*/;
const CALLOUT_HEADING = /key facts|remember|quick revision|tips?\b|shortcut|note/i;

export function hasBengali(s) {
  return BENGALI.test(s);
}

// "Revision notes / পুনৰালোচনাৰ টোকা" → { en: 'Revision notes', as: 'পুনৰালোচনাৰ টোকা' }
export function splitBilingual(text) {
  let from = 0;
  for (;;) {
    const i = text.indexOf(' / ', from);
    if (i === -1) return { en: text.trim(), as: '' };
    const right = text.slice(i + 3);
    const firstLetter = right.match(/[A-Za-zঀ-৿]/);
    if (firstLetter && BENGALI.test(firstLetter[0]) && !BENGALI.test(text.slice(0, i))) {
      return { en: text.slice(0, i).trim(), as: right.trim() };
    }
    from = i + 3;
  }
}

// "Chapter 3 — Number Series" → { label: 'Chapter 3', title: 'Number Series' }
function splitLabel(text) {
  const m = text.match(/^(.*?)\s+[—–]\s+(.*)$/);
  return m ? { label: m[1].trim(), title: m[2].trim() } : { label: '', title: text.trim() };
}

function lines(paragraph) {
  return paragraph.split('\n').map((l) => l.replace(/\\$/, '').trimEnd());
}

function parseQuestion(paragraph) {
  const ls = lines(paragraph);
  const start = ls[0].match(QUESTION_START);
  if (!start) return null;

  const firstOption = ls.findIndex((l) => OPTION.test(l));
  if (firstOption < 1) return parseTrueFalse(ls, start);
  let i = firstOption;
  const options = [];
  while (i < ls.length && OPTION.test(ls[i])) {
    const [, letter, text] = ls[i].match(OPTION);
    options.push({ letter, text });
    i++;
  }
  if (options.length < 2) return null;

  const prompt = [start[2], ...ls.slice(1, firstOption)].filter(Boolean);
  let answer = null;
  const explanation = [];
  let meta = null;

  if (i < ls.length) {
    const a = ls[i].match(ANSWER);
    if (!a) return null; // something we don't understand follows the options
    answer = a[1];
    i++;
    for (; i < ls.length; i++) {
      const l = ls[i];
      const isLast = i === ls.length - 1;
      if (isLast && /^\*[^*].*\*$/.test(l) && l.includes(' · ')) {
        meta = l.slice(1, -1).split(' · ').map((s) => s.trim());
      } else if (l) {
        explanation.push(l.replace(EXPLANATION_LABEL, ''));
      }
    }
  }
  return { type: 'question', num: Number(start[1]), prompt, options, answer, explanation, meta };
}

// "State whether … True or False" questions have no (A)–(D) lines; offer True / False.
function parseTrueFalse(ls, start) {
  const a = ls.findIndex((l) => TF_ANSWER.test(l));
  if (a < 1) return null;
  const answer = ls[a].match(TF_ANSWER)[1].toLowerCase() === 'true' ? 'T' : 'F';
  const explanation = ls.slice(a + 1).filter((l) => l && !/^\*[^*].*\*$/.test(l)).map((l) => l.replace(EXPLANATION_LABEL, ''));
  const metaLine = ls.slice(a + 1).find((l) => /^\*[^*].*\*$/.test(l) && l.includes(' · '));
  return {
    type: 'question',
    num: Number(start[1]),
    prompt: [start[2], ...ls.slice(1, a)].filter(Boolean),
    options: [
      { letter: 'T', text: 'True / সত্য' },
      { letter: 'F', text: 'False / অসত্য' },
    ],
    answer,
    explanation,
    meta: metaLine ? metaLine.slice(1, -1).split(' · ').map((x) => x.trim()) : null,
  };
}

// Rows like "| 2 | C | B1-C01-0002 | 15 | A | B1-C02-0004 |" → { 2: 'C', 15: 'A' }
function parseAnswerKey(markdown) {
  const key = {};
  for (const row of markdown.split('\n')) {
    if (!row.trim().startsWith('|')) continue;
    const cells = row.split('|').map((c) => c.trim());
    for (let c = 0; c < cells.length - 1; c++) {
      // "C", or "A (True)" for a true/false item
      const letter = cells[c + 1].match(/^([A-E])(?:\s*\(.*\))?$/);
      if (/^\d+$/.test(cells[c]) && letter) key[Number(cells[c])] = letter[1];
    }
  }
  return key;
}

export function parseSection(markdown) {
  const paragraphs = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const blocks = [];
  let md = [];
  let calloutNext = false;
  let inAnswerKey = false;
  const answerKeyParts = [];

  const flush = () => {
    if (md.length) blocks.push({ type: 'md', text: md.join('\n\n') });
    md = [];
  };

  for (let k = 0; k < paragraphs.length; k++) {
    let p = paragraphs[k].trim();
    if (!p) continue;

    // A question may span a few paragraphs (prompt, a table, then the options).
    if (!inAnswerKey && IS_QUESTION.test(p) && !parseQuestion(p)) {
      for (let j = k + 1; j < Math.min(k + 5, paragraphs.length); j++) {
        const next = paragraphs[j].trim();
        if (IS_QUESTION.test(next) || /^#/.test(next)) break;
        const joined = paragraphs.slice(k, j + 1).map((x) => x.trim()).join('\n\n');
        if (parseQuestion(joined)) {
          p = joined;
          k = j;
          break;
        }
      }
    }

    const [first, ...rest] = p.split('\n');
    const heading = first.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level <= 2) inAnswerKey = /answer key|উত্তৰমালা/i.test(text);
      if (inAnswerKey) {
        answerKeyParts.push(p);
        continue;
      }
      flush();
      if (level === 1 && !blocks.some((b) => b.type === 'opener')) {
        const { en, as } = splitBilingual(text);
        blocks.push({ type: 'opener', en: splitLabel(en), as: as ? splitLabel(as) : null });
      } else if (level <= 2) {
        const { en, as } = splitBilingual(text);
        const num = en.match(/^(\d+(?:\.\d+)*)\s+(.*)$/);
        blocks.push({ type: 'h2', num: num ? num[1] : '', en: num ? num[2] : en, as });
      } else {
        blocks.push({ type: 'h3', ...splitBilingual(text) });
        calloutNext = CALLOUT_HEADING.test(text);
      }
      if (rest.length) md.push(rest.join('\n'));
      continue;
    }

    if (inAnswerKey) {
      answerKeyParts.push(p);
      continue;
    }

    const q = parseQuestion(p);
    if (q) {
      flush();
      blocks.push(q);
      calloutNext = false;
      continue;
    }

    if (/^\*\*(Instructions|Coverage|Note)\b/i.test(p)) {
      flush();
      blocks.push({ type: 'callout', kind: 'note', text: p });
      continue;
    }
    if (calloutNext) {
      flush();
      blocks.push({ type: 'callout', kind: 'facts', text: p });
      calloutNext = false;
      continue;
    }
    md.push(p);
  }
  flush();

  const questions = blocks.filter((b) => b.type === 'question');
  const isTest = questions.length > 0 && questions.every((q) => !q.answer) && answerKeyParts.length > 0;
  if (isTest) {
    const key = parseAnswerKey(answerKeyParts.join('\n'));
    for (const q of questions) q.answer = key[q.num] ?? null;
  } else if (answerKeyParts.length) {
    blocks.push({ type: 'md', text: answerKeyParts.join('\n\n') });
  }

  return { blocks, isTest, answerKey: isTest ? answerKeyParts.join('\n\n') : '' };
}
