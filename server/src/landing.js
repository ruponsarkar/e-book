// Public website: landing page (with live numbers from the database), policy pages and assets.
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const config = require('./config');
const { catalog } = require('./lib/catalog');
const razorpay = require('./lib/razorpay');
const { EXAMS } = require('./routes/public');

const DIR = path.join(__dirname, '../../landing');
const PAGES = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund & Cancellation Policy',
  delivery: 'Delivery Policy',
  contact: 'Contact us',
};
const COVERS = ['#1f3a5f', '#5a2a35', '#234a3a', '#4a3566', '#7a4a1e', '#1f4f5f', '#3d3d5c', '#6b2f2f'];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const n = (x) => Number(x || 0).toLocaleString('en-IN');
const VERSION = String(Date.now()).slice(-6); // busts browser caches of CSS/JS after a restart

function bookCards(books) {
  return books
    .map(
      (b, i) => `<div class="book">
  <div class="cover" style="background:linear-gradient(135deg, ${COVERS[i % COVERS.length]}, #0f1e33)">
    <div class="cover-top">${esc(config.site.name)}</div>
    <div class="cover-title">${esc(b.title)}</div>
    ${b.assamese ? `<div class="cover-as">${esc(b.assamese)}</div>` : ''}
    <div class="cover-rule"></div>
    <div class="cover-tag">${esc(b.tagline || 'Complete guide')}</div>
  </div>
  <div class="book-stats"><span><b>${n(b.chapters)}</b> chapters</span><span><b>${n(b.tests)}</b> tests</span><span><b>${n(b.questions)}</b> questions</span></div>
</div>`
    )
    .join('\n');
}

async function values() {
  const { books, totals, exams } = await catalog();
  const s = config.site;
  const phoneDigits = s.contactPhone.replace(/\D/g, '');
  const round = (x) => (x >= 1000 ? Math.floor(x / 100) * 100 : x); // "5,600+" reads more honestly than an exact "5,658+"
  return {
    SITE_NAME: esc(s.name),
    SITE_URL: esc(s.url),
    PRICE: esc(s.priceInr),
    QUESTIONS: n(round(totals.questions)),
    CHAPTERS: n(totals.chapters),
    TESTS: n(totals.tests),
    BOOKS_COUNT: n(totals.books),
    EXAM_ADRE3: n(exams.adre3),
    EXAM_ADRE4: n(exams.adre4),
    EXAM_APC: n(exams.apc),
    EXAM_APSI: n(exams.apsi),
    EXAM_SSC: n(exams.ssc),
    BOOK_CARDS: bookCards(books),
    CONTACT_EMAIL: esc(s.contactEmail),
    CONTACT_PHONE: esc(s.contactPhone),
    CONTACT_PHONE_DIGITS: esc(phoneDigits),
    BUSINESS_NAME: esc(s.businessName || s.name),
    BUSINESS_ADDRESS: esc(s.businessAddress),
    DELIVERY_HOURS: esc(s.deliveryHours),
    OFFLINE_DAYS: esc(config.offlineDays),
    YEAR: new Date().getFullYear(),
    UPDATED: new Date(fs.statSync(path.join(DIR, 'pages')).mtime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    VERSION,
    SITE_JSON: JSON.stringify({
      name: s.name,
      price: s.priceInr,
      questions: round(totals.questions),
      exams: EXAMS,
      paymentsReady: razorpay.ready(),
      whatsapp: phoneDigits,
    }).replace(/</g, '\\u003c'),
  };
}

const fill = (tpl, v) => tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (k in v ? v[k] : m));
const read = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');

function landing() {
  const router = express.Router();
  if (!fs.existsSync(path.join(DIR, 'index.html'))) return router;

  // The page loads Razorpay Checkout and Google Fonts; nothing else from outside.
  router.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https://*.razorpay.com'],
        connectSrc: ["'self'", 'https://*.razorpay.com'],
        frameSrc: ['https://api.razorpay.com', 'https://checkout.razorpay.com'],
        formAction: ["'self'"],
        upgradeInsecureRequests: null,
      },
    })
  );

  const page = (render) => async (req, res, next) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      res.type('html').send(render(await values()));
    } catch (e) {
      next(e);
    }
  };

  router.get('/', page((v) => fill(read('index.html'), v)));
  for (const [slug, title] of Object.entries(PAGES)) {
    router.get(`/${slug}`, page((v) => fill(read('page.html'), { ...v, PAGE_TITLE: esc(title), PAGE_BODY: fill(read(`pages/${slug}.html`), v) })));
  }
  router.use('/site', express.static(path.join(DIR, 'site'), { maxAge: '7d' }));
  router.get('/robots.txt', (req, res) => res.type('text').send(`User-agent: *\nAllow: /\nDisallow: /panel/\n`));
  return router;
}

module.exports = { landing };
