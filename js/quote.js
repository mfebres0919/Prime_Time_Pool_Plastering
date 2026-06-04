/* ============================================================
   PRIME TIME POOL PLASTERING — js/quote.js
   Multi-step, conditional "Free Estimate" form.
     • Single-select option steps auto-advance
     • Finish step is skipped for repair-only requests
     • Contact step validates name / phone / email
     • Submits to a success state (wire to email/Formspree later)
   ============================================================ */

(function () {
  'use strict';

  const form  = document.getElementById('quoteForm');
  const stage = document.getElementById('quoteStage');
  if (!form || !stage) return;

  const bar       = document.getElementById('quoteBar');
  const stepLabel = document.getElementById('quoteStepLabel');
  const backBtn   = document.getElementById('quoteBack');
  const nextBtn   = document.getElementById('quoteNext');

  const check = '<span class="opt-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

  /* ── Step definitions (candidates; filtered by `when`) ── */
  const CANDIDATES = [
    {
      key: 'service', type: 'options', two: true,
      title: 'What do you need?',
      sub: 'Pick the option that fits best.',
      options: [
        { value: 'replaster',  label: 'Replaster / Resurface' },
        { value: 'remodel',    label: 'Pool Remodel' },
        { value: 'repair',     label: 'Repair & Maintenance' },
        { value: 'unsure',     label: "Not Sure / Other" }
      ]
    },
    {
      key: 'condition', type: 'options',
      title: "What's the surface like now?",
      sub: 'Helps us gauge the prep work.',
      options: [
        { value: 'stained',  label: 'Stained, rough or chalky' },
        { value: 'cracks',   label: 'Cracks, chips or leaks' },
        { value: 'outdated', label: 'Works fine, just outdated' },
        { value: 'new',      label: 'Brand-new shell (new build)' },
        { value: 'unsure',   label: 'Not sure' }
      ]
    },
    {
      key: 'finish', type: 'options', two: true,
      title: 'Any finish in mind?',
      sub: "No worries if you're undecided.",
      when: function (a) { return a.service !== 'repair'; },
      options: [
        { value: 'plaster', label: 'White Plaster' },
        { value: 'quartz',  label: 'Quartz' },
        { value: 'pebble',  label: 'Pebble' },
        { value: 'unsure',  label: 'Not sure yet' }
      ]
    },
    {
      key: 'size', type: 'options', two: true,
      title: 'About how big is the pool?',
      sub: 'A rough idea is totally fine.',
      options: [
        { value: 'small',  label: 'Small / Spa' },
        { value: 'medium', label: 'Standard backyard' },
        { value: 'large',  label: 'Large / Custom' },
        { value: 'unsure', label: 'Not sure' }
      ]
    },
    {
      key: 'timeline', type: 'options',
      title: 'When are you looking to start?',
      sub: 'No commitment — just helps us plan.',
      options: [
        { value: 'asap',     label: 'As soon as possible' },
        { value: '1-3mo',    label: 'In the next 1–3 months' },
        { value: 'exploring', label: 'Just exploring for now' }
      ]
    },
    {
      key: 'contact', type: 'contact',
      title: 'Where do we send your estimate?',
      sub: "We'll reach out — usually the same day."
    }
  ];

  /* ── State ── */
  const answers = {};
  let index = 0;

  function steps() {
    return CANDIDATES.filter(function (c) { return !c.when || c.when(answers); });
  }

  /* ── Render ── */
  function render() {
    const list = steps();
    if (index >= list.length) index = list.length - 1;
    const step = list[index];

    if (step.type === 'contact') {
      stage.innerHTML = renderContact(step);
      bindContact();
      nextBtn.textContent = 'Send My Request';
    } else {
      stage.innerHTML = renderOptions(step);
      bindOptions(step);
      nextBtn.textContent = 'Continue';
    }

    // nav buttons
    backBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    // option steps auto-advance, so hide Continue unless a choice exists
    if (step.type === 'options') {
      nextBtn.style.display = answers[step.key] ? 'inline-flex' : 'none';
    } else {
      nextBtn.style.display = 'inline-flex';
    }

    // progress
    const pct = Math.round((index / list.length) * 100);
    bar.style.width = Math.max(pct, 6) + '%';
    stepLabel.textContent = 'Step ' + (index + 1) + ' of ' + list.length;
  }

  function renderOptions(step) {
    let html = '<h3 class="quote-step-title">' + step.title + '</h3>';
    html += '<p class="quote-step-sub">' + step.sub + '</p>';
    html += '<div class="quote-options' + (step.two ? ' is-two' : '') + '">';
    step.options.forEach(function (opt) {
      const sel = answers[step.key] === opt.value ? ' is-selected' : '';
      html += '<button type="button" class="quote-option' + sel + '" data-value="' + opt.value + '">' +
              check + '<span>' + opt.label + '</span></button>';
    });
    html += '</div>';
    return html;
  }

  function renderContact(step) {
    const a = answers;
    return '' +
      '<h3 class="quote-step-title">' + step.title + '</h3>' +
      '<p class="quote-step-sub">' + step.sub + '</p>' +
      field('name', 'Full Name', 'text', a.name, 'Jane Doe') +
      field('phone', 'Phone', 'tel', a.phone, '(909) 555-0123') +
      field('email', 'Email', 'email', a.email, 'you@email.com') +
      field('city', 'City / Area', 'text', a.city, 'Riverside, CA') +
      '<div class="quote-field">' +
        '<label for="q-notes">Anything else? (optional)</label>' +
        '<textarea id="q-notes" name="notes" placeholder="Tell us a bit about your pool or project...">' + (a.notes || '') + '</textarea>' +
      '</div>';
  }

  function field(name, label, type, val, ph) {
    return '<div class="quote-field" data-field="' + name + '">' +
      '<label for="q-' + name + '">' + label + '</label>' +
      '<input id="q-' + name + '" name="' + name + '" type="' + type + '" value="' + (val || '') + '" placeholder="' + ph + '" autocomplete="' + name + '" />' +
      '<span class="quote-field-error">Please fill this in.</span>' +
    '</div>';
  }

  /* ── Bindings ── */
  function bindOptions(step) {
    stage.querySelectorAll('.quote-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        answers[step.key] = btn.getAttribute('data-value');
        stage.querySelectorAll('.quote-option').forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        nextBtn.style.display = 'inline-flex';
        setTimeout(advance, 260);   // snappy auto-advance
      });
    });
  }

  function bindContact() {
    stage.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        answers[el.name] = el.value;
        const wrap = el.closest('.quote-field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  }

  /* ── Navigation ── */
  function advance() {
    const list = steps();
    const step = list[index];

    if (step.type === 'options' && !answers[step.key]) { shake(); return; }
    if (step.type === 'contact') { return submit(); }

    if (index < list.length - 1) { index++; render(); scrollToCard(); }
  }

  function goBack() {
    if (index > 0) { index--; render(); }
  }

  function submit() {
    if (!validateContact()) { shake(); return; }
    // TODO: POST `answers` to email / Formspree / backend here.
    bar.style.width = '100%';
    stepLabel.textContent = 'Done';
    backBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    stage.innerHTML =
      '<div class="quote-success">' +
        '<div class="quote-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        '<h3>Request Sent!</h3>' +
        '<p>Thanks, ' + (esc(answers.name) || 'there') + '. We\'ll review your project and reach out soon with your free estimate.</p>' +
      '</div>';
  }

  function validateContact() {
    let ok = true;
    const required = ['name', 'phone', 'email'];
    required.forEach(function (n) {
      const wrap = stage.querySelector('[data-field="' + n + '"]');
      const el = wrap && wrap.querySelector('input');
      let valid = el && el.value.trim() !== '';
      if (valid && n === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (valid && n === 'phone') valid = (el.value.replace(/\D/g, '').length >= 7);
      if (wrap) wrap.classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  function scrollToCard() {
    const card = document.querySelector('.quote-card');
    if (card && card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function shake() {
    const card = document.querySelector('.quote-card');
    if (!card) return;
    card.classList.remove('quote-shake');
    void card.offsetWidth;
    card.classList.add('quote-shake');
  }

  function esc(s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  nextBtn.addEventListener('click', advance);
  backBtn.addEventListener('click', goBack);
  form.addEventListener('submit', function (e) { e.preventDefault(); advance(); });

  render();
})();
