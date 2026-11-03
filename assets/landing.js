/* Aegis Quant landing page: local, synthetic examples and accessible controls. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = false;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const setText = (selector, value) => { const node = $(selector); if (node) node.textContent = value; };
  const rows = values => values.map(([label, value, kind = '']) =>
    `<div class="example-row"><span>${label}</span><strong class="example-value ${kind}">${value}</strong></div>`
  ).join('');
  const example = (heading, values, note = '') =>
    `<div class="example-card"><div class="example-header"><strong>${heading}</strong><span class="demo-badge">Synthetic example</span></div>${rows(values)}${note ? `<p class="example-note muted">${note}</p>` : ''}</div>`;

  function bindChoices(selector, onSelect, { attribute, tabPattern = false } = {}) {
    const buttons = $$(selector);
    if (!buttons.length) return;
    const key = attribute || selector.match(/\[([^\]]+)\]/)?.[1];
    const select = (button, focus = false) => {
      buttons.forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.classList.toggle('is-active', selected);
        if (tabPattern || item.getAttribute('role') === 'tab') {
          item.setAttribute('aria-selected', String(selected));
          item.tabIndex = selected ? 0 : -1;
        } else {
          item.setAttribute('aria-pressed', String(selected));
        }
      });
      if (focus) button.focus();
      onSelect(button.getAttribute(key), button);
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); select(buttons[next], true); }
      });
    });
    select(buttons.find(button => button.getAttribute('aria-selected') === 'true' || button.getAttribute('aria-pressed') === 'true') || buttons[0]);
  }

  const navToggle = $('#nav-toggle');
  const nav = $('#site-nav');
  if (navToggle && nav) {
    const closeNavigation = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(expanded));
      nav.classList.toggle('is-open', expanded);
      document.body.classList.toggle('nav-open', expanded);
    });
    $$('a, button', nav).forEach(link => link.addEventListener('click', closeNavigation));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNavigation();
        navToggle.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNavigation();
    });
    window.matchMedia('(min-width: 781px)').addEventListener('change', event => { if (event.matches) closeNavigation(); });
  }

  const heroPreviews = {
    market: example('The starting point', [
      ['Instrument', 'BTC / USD'], ['Context', 'Two sample venues'],
      ['Source', 'Local synthetic fixture'], ['Data state', 'Illustrative snapshot']
    ], 'A comparison needs a source, a timestamp and an instrument before its numbers can mean anything.'),
    opportunity: example('Costs change the story', [
      ['Currency', 'USD'],
      ['Apparent price difference', '+$9.86'], ['Modeled fees', '−$3.12'],
      ['Modeled execution loss', '−$1.74'], ['Estimated remainder', '+$5.00', 'positive'],
      ['Illustrative uncertainty', '−$0.80 to +$7.60']
    ], 'Hypothetical USD comparison totals illustrate the arithmetic; they are not tied to an actual order quantity. An estimate is not a guaranteed outcome.'),
    risk: example('A useful reason to stop', [
      ['Sample candidate', 'ETH / USD'], ['Apparent price difference', '+$8.40'],
      ['Modeled total costs', '−$9.52'], ['Estimated remainder', '−$1.12', 'negative'],
      ['Illustrated conclusion', 'Do not proceed', 'negative']
    ], 'Amounts are hypothetical USD comparison totals, not an actual order quantity. A price difference can disappear after costs; a rejected candidate can still teach you something.')
  };
  bindChoices('[data-hero-tab]', key => {
    const panel = $('#hero-preview-content');
    if (panel) panel.innerHTML = heroPreviews[key] || heroPreviews.market;
  });

  const objectives = [
    { title: 'Make market information understandable.', copy: 'Bring the instrument, source, timestamp and data quality into view. A useful comparison starts with context.', detail: 'Visitor question: “What am I looking at, and where did it come from?”', basis: 'Design basis: §2.1 and §§4–5.' },
    { title: 'Look beyond the headline price.', copy: 'Study fees, liquidity and execution uncertainty alongside the apparent price difference. The visible number is only the starting point.', detail: 'Visitor question: “What might remain after realistic costs?”', basis: 'Design basis: §1 and §8.' },
    { title: 'Test ideas against evidence.', copy: 'Keep models, baselines, assumptions and limitations visible so research can be questioned and repeated.', detail: 'Visitor question: “What supports this idea, and what could change it?”', basis: 'Design basis: §§10–11.' },
    { title: 'Keep AI inside clear boundaries.', copy: 'Research agents propose and explain. Independent services retain responsibility for permissions, risk and accounting in the intended architecture.', detail: 'Visitor question: “Who can propose an action, and who controls it?”', basis: 'Design basis: §2, §9 and §12.' },
    { title: 'Make every simulated outcome traceable.', copy: 'Connect the decision, modeled action, costs and accounting. Keep unexplained differences visible instead of presenting them as verified.', detail: 'Visitor question: “Can I follow the reasoning behind the result?”', basis: 'Design basis: §§9 and 12–13.' }
  ];
  bindChoices('[data-objective]', key => {
    const item = objectives[Number(key)] || objectives[0];
    const panel = $('#objective-detail');
    if (panel) panel.innerHTML = `<span class="pill">Objective ${Math.max(0, objectives.indexOf(item)) + 1} of 5</span><h3>${item.title}</h3><p>${item.copy}</p><p class="objective-question">${item.detail}</p><p class="muted">${item.basis}</p>`;
  });

  const audiences = {
    newcomer: {
      title: 'Start with the questions. Learn the language as you go.',
      copy: 'You do not need to be a quant to explore the demo. Begin with the guided workflow and discover how data, costs and uncertainty change a research idea.',
      items: ['Quantitative research: studying markets with data and repeatable rules.', 'Simulation: exploring a possible outcome under stated assumptions, without real orders.', 'Follow one example through six clear checkpoints.']
    },
    researcher: {
      title: 'Give every promising idea a fair test.',
      copy: 'The product design connects market context, cost assumptions and research evidence so an interesting result can be inspected before it is trusted.',
      items: ['Compare an idea with a simple baseline.', 'Inspect how changes in costs affect the conclusion.', 'Keep the evidence, limitations and assumptions together.']
    },
    builder: {
      title: 'Understand the responsibilities behind the workspace.',
      copy: 'Explore how the intended architecture separates data, AI research, risk validation, simulation and accounting while keeping their handoffs traceable.',
      items: ['AI agents research, propose and explain.', 'Deterministic services govern permissions, risk and accounting.', 'The current website illustrates these roles; production services are on the roadmap.']
    }
  };
  bindChoices('[data-audience]', key => {
    const item = audiences[key] || audiences.newcomer;
    setText('#audience-title', item.title);
    setText('#audience-copy', item.copy);
    const items = $('#audience-items');
    if (items) items.innerHTML = item.items.map(text => `<li>${text}</li>`).join('');
  });

  const workflow = [
    { title: 'Validate the inputs', description: 'Identify the instrument, source, timestamp and quality of the data. A stale or incomplete input changes what can be concluded.', example: example('Start with the context', [['Instrument', 'BTC / USD'], ['Source', 'Synthetic fixture'], ['Venue context', 'Sample venue A → B'], ['Quality check', 'Illustrative only']]), note: 'Checkpoint: production inputs would need source and freshness validation. This website uses a local sample.' },
    { title: 'Inspect the candidate', description: 'Compare the apparent opportunity with modeled costs, liquidity and practical constraints.', example: heroPreviews.opportunity, note: 'Checkpoint: a positive headline difference does not establish a profitable or executable opportunity.' },
    { title: 'Assess the research', description: 'Review the model, assumptions and supporting evidence. A promising-looking sample is not proof that a strategy works.', example: example('Ask for the evidence', [['Model assumptions', 'Explicit and inspectable'], ['Cost sensitivity', '−$0.80 to +$7.60 USD'], ['Baseline comparison', 'Required in the design'], ['Current evidence', 'Illustrative sample only']], 'A hypothetical USD sensitivity range for the sample comparison, not a measured confidence interval or an actual order quantity.'), note: 'Checkpoint: reproducible research and suitable baselines belong to the platform design. This demo does not validate a strategy.' },
    { title: 'Check the boundaries', description: 'A proposal must fit the applicable permissions, capital and risk limits. AI cannot bypass these checks.', example: example('Separate the responsibilities', [['Research agent', 'Propose & explain'], ['Risk service', 'Validate configured limits'], ['Order mode', 'Simulation only'], ['Live order authority', 'Unavailable']]), note: 'Checkpoint: the website illustrates these controls. It does not run a production risk service or submit orders.' },
    { title: 'Simulate the action', description: 'Explore modeled orders and possible fills, delays and costs under explicit assumptions.', example: example('Follow a modeled outcome', [['Currency', 'USD'], ['Apparent difference', '+$9.86'], ['Modeled fees', '−$3.12'], ['Modeled execution loss', '−$1.74'], ['Estimated remainder', '+$5.00', 'positive']], 'Hypothetical comparison totals only; no actual order quantity or fill is represented.'), note: 'Checkpoint: fills, delays and costs are hypothetical. A simulated result cannot guarantee a real outcome.' },
    { title: 'Reconcile and explain', description: 'Connect the outcome to the sample ledger and decision history, and keep unresolved differences visible.', example: example('Close the reasoning loop', [['Currency', 'USD'], ['Starting difference', '+$9.86'], ['Modeled total costs', '−$4.86'], ['Illustrative remainder', '+$5.00', 'positive'], ['Trace', 'Inputs → assumptions → result']], 'Hypothetical USD comparison totals explain the arithmetic, not an actual order quantity or a verified ledger.'), note: 'Checkpoint: this is explanatory arithmetic. Durable financial accounting and verified reconciliation are planned services.' }
  ];
  const workflowButtons = $$('[data-workflow-step]');
  const playButton = $('#workflow-play');
  let workflowIndex = 0;
  let workflowTimer = null;
  const stopWorkflow = () => {
    if (workflowTimer !== null) window.clearInterval(workflowTimer);
    workflowTimer = null;
    if (playButton) {
      playButton.setAttribute('aria-pressed', 'false');
      playButton.textContent = reducedMotion.matches || motionPaused ? 'Use the step controls' : 'Play the example';
      playButton.disabled = reducedMotion.matches || motionPaused;
    }
  };
  const showWorkflow = (index, manual = true, focus = false) => {
    if (manual) stopWorkflow();
    workflowIndex = Math.max(0, Math.min(workflow.length - 1, Number(index) || 0));
    const item = workflow[workflowIndex];
    workflowButtons.forEach((button, position) => {
      const active = position === workflowIndex;
      button.classList.toggle('active', active);
      button.classList.toggle('is-active', active);
      button.classList.toggle('is-complete', position < workflowIndex);
      button.setAttribute('aria-current', active ? 'step' : 'false');
      button.setAttribute('aria-pressed', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (focus) workflowButtons[workflowIndex]?.focus();
    setText('#workflow-title', item.title);
    setText('#workflow-description', item.description);
    setText('#workflow-note', item.note);
    const examplePanel = $('#workflow-example');
    if (examplePanel) examplePanel.innerHTML = item.example;
    const progress = $('#workflow-progress');
    if (progress) {
      if (progress.classList.contains('step-count')) progress.textContent = `${String(workflowIndex + 1).padStart(2, '0')} / ${String(workflow.length).padStart(2, '0')}`;
      else if (progress instanceof HTMLProgressElement) { progress.max = workflow.length; progress.value = workflowIndex + 1; }
      else { progress.style.setProperty('--workflow-progress', `${(workflowIndex + 1) / workflow.length * 100}%`); progress.style.width = `${(workflowIndex + 1) / workflow.length * 100}%`; }
      progress.setAttribute('aria-label', `Step ${workflowIndex + 1} of ${workflow.length}`);
    }
    setText('#workflow-step-count', `Step ${workflowIndex + 1} of ${workflow.length}`);
  };
  workflowButtons.forEach((button, index) => {
    button.addEventListener('click', () => showWorkflow(button.getAttribute('data-workflow-step')));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % workflow.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + workflow.length - 1) % workflow.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = workflow.length - 1;
      if (next !== undefined) { event.preventDefault(); showWorkflow(next, true, true); }
    });
  });
  if (playButton) playButton.addEventListener('click', () => {
    if (workflowTimer !== null) { stopWorkflow(); return; }
    if (reducedMotion.matches || motionPaused || document.hidden) return;
    if (workflowIndex === workflow.length - 1) showWorkflow(0, false);
    playButton.textContent = 'Pause the example';
    playButton.setAttribute('aria-pressed', 'true');
    workflowTimer = window.setInterval(() => {
      if (workflowIndex >= workflow.length - 1) { stopWorkflow(); return; }
      showWorkflow(workflowIndex + 1, false);
      if (workflowIndex === workflow.length - 1) stopWorkflow();
    }, 1800);
  });
  $('#workflow-reset')?.addEventListener('click', () => showWorkflow(0));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopWorkflow(); });
  reducedMotion.addEventListener('change', stopWorkflow);
  if (workflowButtons.length) { showWorkflow(0); stopWorkflow(); }
  const motionToggle = $('#motion-toggle');
  const updateMotionToggle = () => {
    if (!motionToggle) return;
    motionToggle.disabled = reducedMotion.matches;
    motionToggle.setAttribute('aria-pressed', String(motionPaused || reducedMotion.matches));
    motionToggle.textContent = reducedMotion.matches ? 'Reduced motion enabled' : motionPaused ? 'Resume animations' : 'Pause animations';
  };
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      motionPaused = !motionPaused;
      document.body.classList.toggle('motion-paused', motionPaused);
      stopWorkflow();
      updateMotionToggle();
    });
    reducedMotion.addEventListener('change', updateMotionToggle);
    updateMotionToggle();
  }

  const products = {
    monitor: {
      title: 'Understand a market', copy: 'Start with the instrument and its context. The designed workspace keeps currencies, sources, sessions and data quality visible.',
      points: ['Cryptocurrency, US equities and Indian equities in the product design.', 'Different markets retain their own context and constraints.', 'The current workspace uses synthetic snapshots.'],
      visual: example('Market context, at a glance', [['BTC / USD', 'Cryptocurrency'], ['AAPL / USD', 'US equities'], ['RELIANCE / INR', 'Indian equities'], ['Feed status', 'Synthetic demo']])
    },
    compare: {
      title: 'Compare the full cost', copy: 'Look beyond the headline price difference. Explore how modeled fees and execution loss change a candidate.',
      points: ['Separate the apparent spread from estimated costs.', 'Make uncertainty part of the explanation.', 'Accept that some candidates should be rejected.'],
      visual: heroPreviews.opportunity
    },
    research: {
      title: 'Test a research idea', copy: 'The intended research workflow asks for evidence, repeatable assumptions and a baseline before treating a result as useful.',
      points: ['Inspect the assumptions behind a sample research proposal.', 'Compare an idea with simpler alternatives.', 'Understand why historical or simulated results have limits.'],
      visual: example('A research checklist', [['Research question', 'Visible'], ['Assumptions', 'Inspectable'], ['Simple baseline', 'Required by design'], ['Result status', 'Illustrative, unvalidated']])
    },
    explain: {
      title: 'Follow the reasoning', copy: 'Explore the planned roles of AI research agents and the independent services that check permissions, risk and accounting.',
      points: ['Agents analyze, propose and explain.', 'Risk controls cannot be changed or bypassed by agents.', 'A proposed action should leave a traceable decision history.'],
      visual: example('Who is responsible?', [['AI research agent', 'Analyze & propose'], ['Risk service', 'Check permissions & limits'], ['Simulation service', 'Model the action'], ['Accounting service', 'Reconcile & record']])
    }
  };
  bindChoices('[data-product]', key => {
    const item = products[key] || products.monitor;
    setText('#product-title', item.title);
    setText('#product-copy', item.copy);
    const points = $('#product-points');
    if (points) points.innerHTML = item.points.map(text => `<li>${text}</li>`).join('');
    const visual = $('#product-visual');
    if (visual) visual.innerHTML = item.visual;
    const demoLink = $('#product-demo-link');
    if (demoLink) demoLink.href = `dashboard/index.html#${({ monitor: 'markets', compare: 'comparison', research: 'strategies', explain: 'agents' })[key] || 'markets'}`;
  });

  const glossary = {
    spread: 'Spread means a difference between two quoted prices. Costs and uncertainty can change what that difference means.',
    liquidity: 'Liquidity describes how much can be bought or sold near a quoted price. A displayed price does not guarantee an available fill.',
    backtest: 'A backtest studies a strategy using historical data and stated assumptions. It does not establish future performance.',
    reconciliation: 'Reconciliation compares records to explain whether balances, actions and costs agree. Unexplained differences should stay visible.',
    provenance: 'Provenance means the source and history of information: where it came from, when it was observed and how it was used.'
  };
  $$('[data-term]').forEach(button => button.addEventListener('click', () => {
    const term = button.getAttribute('data-term');
    const output = $('#glossary-definition');
    if (output && glossary[term]) {
      output.textContent = glossary[term];
      $$('[data-term]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }
  }));

  const sourceButton = $('#sources-button');
  const modalRoot = $('#source-modal-root');
  let sourceDialog = null;
  let previousFocus = null;
  const closeSources = () => {
    if (!sourceDialog) return;
    modalRoot.replaceChildren();
    sourceDialog = null;
    document.body.classList.remove('modal-open');
    previousFocus?.focus();
  };
  if (sourceButton && modalRoot) sourceButton.addEventListener('click', () => {
    if (sourceDialog) return;
    previousFocus = document.activeElement;
    modalRoot.innerHTML = `<div class="modal-overlay"><section class="source-dialog" role="dialog" aria-modal="true" aria-labelledby="source-title" aria-describedby="source-intro" tabindex="-1"><header class="modal-header"><h2 id="source-title">The design behind Aegis Quant</h2><button class="icon-button" type="button" data-close-sources aria-label="Close design basis">×</button></header><div class="modal-body"><p id="source-intro">This landing page is based on <strong>AEGIS QUANT — Master Specification V4.0 (Merged and Hardened)</strong>, the document supplied by the owner. The page describes the product design and uses a synthetic website demonstration.</p><p><strong>The mission and vision are proposed brand statements derived from that specification and the research context below, awaiting the owner's review.</strong></p><dl class="source-references"><dt>§1 · Product definition · page 2</dt><dd>The product connects market intelligence, quantitative research and execution simulation.</dd><dt>§2 · Non-negotiable principles · pages 3–4</dt><dd>Visible provenance and assumptions, independent controls and bounded AI responsibilities.</dd><dt>§3 · Scope · page 4</dt><dd>Research and simulation as the stated scope; no live order submission.</dd><dt>§8 · Opportunity and comparison design · page 8</dt><dd>Costs, liquidity and uncertainty inform an opportunity assessment.</dd><dt>§9 · Agent architecture · pages 9–10</dt><dd>Agents analyze, propose and explain while services retain control responsibilities.</dd><dt>§11 · Research integrity · pages 11–12</dt><dd>Evidence, reproducibility, baselines and realistic interpretation of research results.</dd><dt>§12 · Risk, accounting and reconciliation · pages 12–14</dt><dd>Hard limits and traceable accounting with unresolved differences kept visible.</dd><dt>§14 · Frontend workspace · pages 15–16</dt><dd>The intended workspace brings these questions into connected product areas.</dd></dl><h3>Research and communication context</h3><p>Official pages about quantitative research and learning informed the page's communication themes. The statements below are our editorial interpretation for Aegis Quant.</p><ul class="source-context"><li><a href="https://www.quantconnect.com/about" target="_blank" rel="noopener noreferrer">QuantConnect · Culture and Purpose</a>: connect research questions with understandable tools and context.</li><li><a href="https://docs.numer.ai/" target="_blank" rel="noopener noreferrer">Numerai · Official documentation</a>: keep evidence and evaluation visible when discussing model output.</li><li><a href="https://www.quantinsti.com/about-us" target="_blank" rel="noopener noreferrer">QuantInsti · About Us</a>: help newcomers understand the process before introducing complex tools.</li></ul><p class="muted">These sources informed our communication approach. Aegis Quant is independently developed and is not affiliated with these organizations. Sources were reviewed on 10 October 2026. External source links open in a new tab.</p><p class="muted">The current website does not connect licensed market feeds, trading services, production research agents or financial accounting engines. Figures are synthetic illustrations, not investment performance.</p></div></section></div>`;
    sourceDialog = $('.source-dialog', modalRoot);
    document.body.classList.add('modal-open');
    $('[data-close-sources]', modalRoot).addEventListener('click', closeSources);
    $('.modal-overlay', modalRoot).addEventListener('click', event => { if (event.target.classList.contains('modal-overlay')) closeSources(); });
    sourceDialog.focus();
  });
  document.addEventListener('keydown', event => {
    if (!sourceDialog) return;
    if (event.key === 'Escape') { event.preventDefault(); closeSources(); return; }
    if (event.key === 'Tab') {
      const focusable = $$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', sourceDialog).filter(node => !node.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); sourceDialog.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === sourceDialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === sourceDialog)) { event.preventDefault(); first.focus(); }
    }
  });

  const config = window.AEGIS_CONTACT || {};
  const email = typeof config.email === 'string' ? config.email.trim() : '';
  const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  const addressReady = validEmail.test(email) && !/[\r\n]/.test(email);
  const emailReady = config.mode === 'email' && addressReady;
  const directMode = config.mode === 'form';
  let directReady = false;
  let csrfToken = '';
  let contactEndpoint = null;
  let submitting = false;
  const form = $('#contact-form');
  const status = $('#contact-status');
  const submit = $('#contact-submit');
  const copyButton = $('#contact-copy');
  const emailLink = $('#contact-email-link');
  const contactNote = $('#contact-config-note');
  const contactPreview = $('#contact-preview');
  const contactChannels = $('#contact-channel-list');
  const clearContactPreview = () => {
    if (contactPreview) { contactPreview.hidden = true; contactPreview.innerHTML = ''; }
  };
  const showContactPreview = ({ name, email: replyEmail, topic, message }) => {
    if (!contactPreview || directReady) return;
    contactPreview.innerHTML = `<h3 class="contact-preview-heading">Your message preview</h3><p>Nothing has been sent. Direct delivery will be activated on Hostinger.</p><dl><div class="contact-preview-row"><dt>Name</dt><dd>${escapeHTML(name)}</dd></div><div class="contact-preview-row"><dt>Reply email</dt><dd>${escapeHTML(replyEmail)}</dd></div><div class="contact-preview-row"><dt>Topic</dt><dd>${escapeHTML(topic)}</dd></div></dl><p class="contact-preview-message">${escapeHTML(message)}</p>`;
    contactPreview.hidden = false;
  };
  clearContactPreview();
  const updateStatus = (message, kind = '') => {
    if (status) { status.textContent = message; status.classList.remove('is-error', 'is-success'); if (kind) status.classList.add(kind); }
  };
  setText('#contact-public-name', config.publicName || 'Aegis Quant');
  setText('#contact-public-title', config.title || '');
  if (emailLink) {
    emailLink.hidden = !addressReady;
    if (addressReady) { emailLink.href = `mailto:${email}`; emailLink.textContent = email; }
    else emailLink.removeAttribute('href');
  }
  if (copyButton) copyButton.hidden = !addressReady;
  const setContactState = () => {
    if (directReady) clearContactPreview();
    if (submit) {
      submit.disabled = submitting || (!emailReady && !directMode);
      submit.textContent = submitting ? 'Sending message…' : directReady ? 'Send message' : directMode ? 'Preview message' : emailReady ? 'Open email draft' : 'Contact setup pending';
    }
    if (contactNote) contactNote.textContent = directReady
      ? "Your details and message will be submitted to Aegis Quant's configured mail service. This page does not persist your message in browser storage."
      : directMode
        ? 'Direct delivery needs secure hosting configuration. Email Tanay directly while setup is completed.'
        : emailReady
          ? 'This opens your email app with a draft. The website does not send or store your message.'
          : 'Contact delivery is being configured. This preview does not send or store messages.';
  };
  setContactState();
  if (!emailReady && !directMode) updateStatus('The contact form will become available after the owner confirms contact details and a delivery method.');
  if (directMode) updateStatus('Form preview only—nothing has been sent. Direct delivery will be activated on Hostinger.');
  const checkContactReadiness = async () => {
    if (!directMode || !addressReady || window.location.protocol !== 'https:' || typeof config.endpoint !== 'string') return;
    try {
      const endpoint = new URL(config.endpoint, window.location.href);
      if (endpoint.origin !== window.location.origin || endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) return;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      let response;
      try { response = await fetch(endpoint.href, { method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal }); }
      finally { window.clearTimeout(timeout); }
      const data = await response.json();
      if (response.ok && data.ready === true && typeof data.csrfToken === 'string' && data.csrfToken.length >= 16 && data.csrfToken.length <= 256) {
        contactEndpoint = endpoint;
        csrfToken = data.csrfToken;
        directReady = true;
        setContactState();
        updateStatus('The contact form is ready. Complete the fields and consent below to send your message.');
      }
    } catch (_) { /* Keep the honest preview state when hosting or mail is unconfigured. */ }
  };
  checkContactReadiness();
  if (contactChannels) {
    const channels = [];
    if (typeof config.phone === 'string' && /^\+?[\d\s().-]{7,24}$/.test(config.phone.trim())) channels.push(`<a class="contact-channel" href="tel:${escapeHTML(config.phone.replace(/[\s().-]/g, ''))}">${escapeHTML(config.phone.trim())}</a>`);
    if (typeof config.whatsapp === 'string') {
      const number = config.whatsapp.replace(/[^\d]/g, '');
      if (/^\d{7,15}$/.test(number)) channels.push(`<a class="contact-channel" href="https://wa.me/${number}" target="_blank" rel="noopener noreferrer">WhatsApp <span class="sr-only">(opens a new tab)</span></a>`);
    }
    if (typeof config.linkedin === 'string') {
      try {
        const url = new URL(config.linkedin);
        if (url.protocol === 'https:' && /^(www\.)?linkedin\.com$/.test(url.hostname)) channels.push(`<a class="contact-channel" href="${escapeHTML(url.href)}" target="_blank" rel="noopener noreferrer">LinkedIn <span class="sr-only">(opens a new tab)</span></a>`);
      } catch (_) { /* An invalid configured link remains absent. */ }
    }
    if (typeof config.location === 'string' && config.location.trim()) channels.push(`<span class="contact-channel">${escapeHTML(config.location.trim())}</span>`);
    contactChannels.innerHTML = channels.join('');
  }
  if (form) {
    form.noValidate = true;
    const fields = ['name', 'email', 'topic', 'message', 'consent'].map(name => form.elements.namedItem(name)).filter(Boolean);
    const clearError = field => {
      field.removeAttribute('aria-invalid');
      const errorId = `${field.id || `contact-${field.name}`}-error`;
      const error = document.getElementById(errorId);
      if (error) error.textContent = '';
    };
    const showError = (field, message) => {
      field.setAttribute('aria-invalid', 'true');
      const errorId = `${field.id || `contact-${field.name}`}-error`;
      let error = document.getElementById(errorId);
      if (!error) { error = document.createElement('span'); error.id = errorId; error.className = 'field-error'; field.insertAdjacentElement('afterend', error); }
      error.textContent = message;
      const ids = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(errorId);
      field.setAttribute('aria-describedby', [...ids].join(' '));
    };
    fields.forEach(field => field.addEventListener('input', () => { clearError(field); clearContactPreview(); }));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting) return;
      if (!emailReady && !directMode) { updateStatus('Contact delivery is being configured. No message has been sent.'); return; }
      fields.forEach(clearError);
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const replyEmail = String(data.get('email') || '').trim();
      const topic = String(data.get('topic') || 'Aegis Quant enquiry').trim();
      const message = String(data.get('message') || '').trim();
      const consent = $('#contact-consent');
      let firstInvalid = null;
      const invalid = (fieldName, reason) => { const field = form.elements.namedItem(fieldName); if (field) { showError(field, reason); if (!firstInvalid) firstInvalid = field; } };
      if (name.length < 2 || name.length > 100) invalid('name', 'Please enter a name between 2 and 100 characters.');
      if (!validEmail.test(replyEmail) || replyEmail.length > 254 || /[\r\n]/.test(replyEmail)) invalid('email', 'Please enter a valid email address.');
      if (topic.length < 2 || topic.length > 80 || /[\r\n]/.test(topic)) invalid('topic', 'Please choose a valid enquiry topic.');
      if (message.length < 20 || message.length > 3000) invalid('message', 'Please write a message between 20 and 3,000 characters.');
      if (directMode && consent && !consent.checked) invalid('consent', 'Please agree to sending these details to the contact mailbox.');
      if (firstInvalid) { updateStatus('Please check the highlighted fields.', 'is-error'); firstInvalid.focus(); return; }
      if (directMode) {
        if (!directReady || !contactEndpoint || !csrfToken || !consent) {
          showContactPreview({ name, email: replyEmail, topic, message });
          updateStatus('Form preview only—nothing has been sent. Direct delivery will be activated on Hostinger.');
          return;
        }
        const payload = { name, email: replyEmail, topic, message, website: String(data.get('website') || ''), consent: true, csrfToken };
        if (new TextEncoder().encode(JSON.stringify(payload)).byteLength > 8192) { updateStatus('Your message is too large. Please shorten it and try again.', 'is-error'); return; }
        submitting = true;
        setContactState();
        updateStatus('Sending your message…');
        try {
          const response = await fetch(contactEndpoint.href, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-Token': csrfToken }, body: JSON.stringify(payload) });
          const result = await response.json();
          if (response.ok && result.ok === true) {
            updateStatus('Your message has been accepted for delivery. Thank you for getting in touch.', 'is-success');
            form.reset();
            fields.forEach(clearError);
          } else {
            updateStatus(typeof result.message === 'string' && result.message ? result.message : 'The message could not be sent. Your details remain here so you can try again or email directly.', 'is-error');
            if (response.status === 403 || response.status === 503) { directReady = false; csrfToken = ''; checkContactReadiness(); }
          }
        } catch (_) {
          updateStatus('Delivery could not be confirmed. Your details remain here. You can email directly instead.', 'is-error');
        } finally { submitting = false; setContactState(); }
        return;
      }
      const subject = `Aegis Quant — ${topic.replace(/[\r\n]/g, ' ')}`;
      const body = `Name: ${name}\nReply email: ${replyEmail}\nTopic: ${topic}\n\n${message}`;
      const draft = document.createElement('a');
      draft.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      draft.hidden = true;
      form.appendChild(draft);
      draft.click();
      draft.remove();
      updateStatus('Your email draft is ready. Send it in your email app. No message has been sent by this website.', 'is-success');
    });
  }
  if (copyButton) copyButton.addEventListener('click', async () => {
    if (!addressReady) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      updateStatus('Email address copied.');
    } catch (_) {
      updateStatus(`Copy this email address: ${email}`);
      if (emailLink) { const range = document.createRange(); range.selectNodeContents(emailLink); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); emailLink.focus(); }
    }
  });

  const scrollProgress = $('#scroll-progress-bar');
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / scrollable))})`;
  };
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  const revealElements = $$('.reveal');
  if (revealElements.length) {
    revealElements.forEach((element, index) => {
      if (!element.dataset.reveal) element.dataset.reveal = index % 3 === 2 ? 'up' : index % 2 ? 'right' : 'left';
      element.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
    });
    if (reducedMotion.matches || !('IntersectionObserver' in window)) revealElements.forEach(element => element.classList.add('is-visible'));
    else {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
      revealElements.forEach(element => observer.observe(element));
      document.body.classList.add('js-ready');
      reducedMotion.addEventListener('change', event => { if (event.matches) { revealElements.forEach(element => element.classList.add('is-visible')); observer.disconnect(); } });
    }
  }

  setText('#copyright-year', new Date().getFullYear());
})();
