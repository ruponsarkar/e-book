(() => {
  const DATA = JSON.parse(document.getElementById('site-data').textContent);
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // ---- Sample questions (exactly as in the books) ----------------------------------------
  const SAMPLES = [
    {
      tab: 'Assam GK',
      meta: 'Assam General Knowledge · Chapter 1',
      q: 'In the Mahabharata and the Ramayana, the region of ancient Assam is called:',
      as: 'মহাভাৰত আৰু ৰামায়ণত প্ৰাচীন অসমৰ অঞ্চলটোক কি বুলি কোৱা হৈছে?',
      opts: [['Kalinga', 'কলিংগ'], ['Pragjyotisha', 'প্ৰাগজ্যোতিষ'], ['Magadha', 'মগধ'], ['Vanga', 'বংগ']],
      answer: 1,
      en: 'The epics call the land Pragjyotisha; its capital Pragjyotishpura was in the Guwahati area.',
      bn: 'মহাকাব্য দুখনত এই দেশক প্ৰাগজ্যোতিষ বোলা হৈছে; ইয়াৰ ৰাজধানী প্ৰাগজ্যোতিষপুৰ আছিল গুৱাহাটী অঞ্চলত।',
      tags: 'ADRE-III, ADRE-IV, APC, APSI',
    },
    {
      tab: 'Maths',
      meta: 'General Mathematics · Simplification (BODMAS)',
      q: 'Simplify: 18 + 6 ÷ 3 × 2 − 4',
      as: 'সৰল কৰা: ১৮ + ৬ ÷ ৩ × ২ − ৪',
      opts: [['10', '১০'], ['18', '১৮'], ['14', '১৪'], ['22', '২২']],
      answer: 1,
      en: 'Division and multiplication first, left to right: 6 ÷ 3 = 2, 2 × 2 = 4; then 18 + 4 − 4 = 18.',
      bn: 'আগতে হৰণ আৰু পূৰণ, বাওঁফালৰ পৰা: ৬ ÷ ৩ = ২, ২ × ২ = ৪; তাৰ পিছত ১৮ + ৪ − ৪ = ১৮।',
      tags: 'ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC',
    },
    {
      tab: 'English',
      meta: 'General English · Articles and determiners',
      q: 'Choose the correct option to fill in the blank: He is ___ honest man.',
      as: 'খালী ঠাইত বহুৱাবলৈ শুদ্ধ বিকল্পটো বাছি উলিওৱা:',
      opts: [['a', ''], ['an', ''], ['the', ''], ['no article', '']],
      answer: 1,
      en: "Rule: 'Honest' begins with a vowel sound (the 'h' is silent).",
      bn: "'Honest'-ৰ 'h' নিমাত, সেয়ে আৰম্ভণি স্বৰধ্বনিৰে।",
      tags: 'ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC',
    },
    {
      tab: 'Reasoning',
      meta: 'Logical Reasoning · Classification',
      q: 'Choose the odd one out:',
      as: 'বেলেগটো (খাপ নোখোৱা) বাছি উলিওৱা:',
      opts: [['Rose', 'গোলাপ'], ['Lotus', 'পদুম'], ['Mango', 'আম'], ['Jasmine', 'যূতি ফুল']],
      answer: 2,
      en: 'Odd one: Mango — the others are flowers; mango is a fruit.',
      bn: 'বেলেগটো: আম — বাকীকেইটা ফুল; আম এবিধ ফল।',
      tags: 'ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC',
    },
  ];
  const L = 'ABCD';
  let current = 0;

  function renderSample() {
    const s = SAMPLES[current];
    $('#sample').innerHTML = `
      <div class="s-meta">${esc(s.meta)}</div>
      <p class="s-q">${esc(s.q)}</p>
      <p class="s-as">${esc(s.as)}</p>
      ${s.opts
        .map(
          ([en, as], i) =>
            `<button class="s-opt" data-i="${i}"><span class="s-letter">${L[i]}</span><span>${esc(en)}${as ? ` <span class="s-asopt">/ ${esc(as)}</span>` : ''}</span></button>`
        )
        .join('')}
      <div id="s-after"></div>`;
    $('#sample').querySelectorAll('.s-opt').forEach((b) => b.addEventListener('click', () => pick(Number(b.dataset.i))));
  }

  function pick(i) {
    const s = SAMPLES[current];
    const right = i === s.answer;
    $('#sample').querySelectorAll('.s-opt').forEach((b) => {
      const n = Number(b.dataset.i);
      b.disabled = true;
      if (n === s.answer) b.classList.add('ok');
      else if (n === i) b.classList.add('bad');
    });
    $('#s-after').innerHTML = `
      <div class="s-result">
        <b>${right ? 'Correct!' : 'Not quite.'} Answer (${L[s.answer]}) ${esc(s.opts[s.answer][0])}</b>
        <p>${esc(s.en)}</p>
        <p class="bn">${esc(s.bn)}</p>
      </div>
      <div class="s-tags">Important for: ${esc(s.tags)}</div>
      <div class="s-cta">
        <button class="btn btn-ghost btn-sm" id="s-next">Next question →</button>
        <span>${Number(DATA.questions).toLocaleString('en-IN')}+ more like this in the app.</span>
      </div>`;
    $('#s-next').addEventListener('click', () => selectTab((current + 1) % SAMPLES.length));
  }

  function selectTab(i) {
    current = i;
    document.querySelectorAll('#sample-tabs .tab').forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    renderSample();
  }

  $('#sample-tabs').innerHTML = SAMPLES.map((s, i) => `<button class="tab" role="tab" aria-selected="${i === 0}">${esc(s.tab)}</button>`).join('');
  document.querySelectorAll('#sample-tabs .tab').forEach((t, i) => t.addEventListener('click', () => selectTab(i)));
  renderSample();

  // ---- Exam chips ------------------------------------------------------------------------
  const chosen = new Set();
  $('#exam-chips').innerHTML = DATA.exams.map((e) => `<button type="button" class="chip" aria-pressed="false">${esc(e)}</button>`).join('');
  $('#exam-chips')
    .querySelectorAll('.chip')
    .forEach((c, i) =>
      c.addEventListener('click', () => {
        const e = DATA.exams[i];
        chosen.has(e) ? chosen.delete(e) : chosen.add(e);
        c.setAttribute('aria-pressed', String(chosen.has(e)));
      })
    );

  // ---- Registration + Razorpay ------------------------------------------------------------
  const form = $('#reg-form');
  const btn = $('#pay-btn');
  const errBox = $('#form-err');
  const btnText = btn.textContent;

  if (!DATA.paymentsReady) {
    $('#pay-off').hidden = false;
    btn.disabled = true;
  }

  const showError = (msg) => {
    errBox.textContent = msg;
    errBox.hidden = !msg;
    if (msg) errBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  const busy = (on, label) => {
    btn.disabled = on;
    btn.textContent = on ? label : btnText;
  };

  function loadCheckout() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load the payment window. Check your internet and try again.'));
      document.head.appendChild(s);
    });
  }
  // Start loading early once the visitor shows interest.
  form.addEventListener('focusin', () => loadCheckout().catch(() => {}), { once: true });

  async function post(path, body) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
    return data;
  }

  function validate() {
    const f = form.elements;
    let bad = null;
    const mark = (el, ok) => {
      el.classList.toggle('invalid', !ok);
      if (!ok && !bad) bad = el;
    };
    const phone = f.phone.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    mark(f.name, f.name.value.trim().length >= 2);
    mark(f.phone, /^[6-9]\d{9}$/.test(phone));
    mark(f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()));
    if (bad) {
      bad.focus();
      return 'Please check the highlighted field.';
    }
    if (!f.agree.checked) return 'Please accept the terms to continue.';
    return '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const problem = validate();
    if (problem) return showError(problem);

    const f = form.elements;
    const params = new URLSearchParams(location.search);
    const source = params.get('utm_source') || params.get('ref') || (document.referrer && !document.referrer.includes(location.host) ? new URL(document.referrer).host : '');

    busy(true, 'Starting payment…');
    try {
      const [order] = await Promise.all([
        post('/public/register', {
          name: f.name.value,
          phone: f.phone.value,
          email: f.email.value,
          district: f.district.value,
          exams: [...chosen],
          agree: f.agree.checked,
          source,
        }),
        loadCheckout(),
      ]);

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: 'Full access: all books and test papers',
        prefill: order.prefill,
        theme: { color: '#1f3a5f' },
        handler: async (resp) => {
          busy(true, 'Confirming payment…');
          try {
            const done = await post('/public/verify', resp);
            showSuccess(done);
          } catch (err) {
            showError(`Payment received but we couldn't confirm it here (${err.message}). Don't pay again; message us with payment ID ${resp.razorpay_payment_id}.`);
            busy(false);
          }
        },
        modal: {
          ondismiss: () => {
            busy(false);
            showError('Payment was cancelled. You can try again whenever you are ready.');
          },
        },
      });
      rzp.on('payment.failed', (r) => {
        busy(false);
        showError(`Payment failed: ${r.error?.description || 'please try again or use another method'}. If money was deducted, it will be returned automatically.`);
      });
      rzp.open();
    } catch (err) {
      busy(false);
      showError(err.message);
    }
  });

  function showSuccess(d) {
    form.hidden = true;
    const box = $('#success');
    box.hidden = false;
    $('#success-text').innerHTML = `Thank you, <b>${esc(d.name)}</b>. Your user ID, password and the Play Store link will be sent to <b>+91 ${esc(d.phone)}</b> on WhatsApp and to <b>${esc(d.email)}</b> within ${esc(d.deliveryHours)} hours.`;
    $('#receipt').innerHTML = `<dt>Payment ID</dt><dd>${esc(d.paymentId)}</dd><dt>Amount</dt><dd>₹${esc(DATA.price)}</dd><dt>Email</dt><dd>${esc(d.email)}</dd>`;
    const wa = $('#success-wa');
    if (DATA.whatsapp) wa.href = `https://wa.me/${DATA.whatsapp}?text=${encodeURIComponent(`Hi, I registered for ${DATA.name}. Payment ID: ${d.paymentId}`)}`;
    else wa.hidden = true;
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // ---- Hide the floating mobile button while the form is on screen ---------------------------
  const cta = $('#mobile-cta');
  if ('IntersectionObserver' in window && cta) {
    new IntersectionObserver((entries) => cta.classList.toggle('hide', entries.some((e) => e.isIntersecting)), { threshold: 0.15 }).observe($('#register'));
  }
})();
