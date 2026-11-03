/* Aegis Quant sign-in shell. Live identity is deliberately opt-in. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.AEGIS_AUTH || { mode: 'preview' };
  const overlay = $('[data-auth-overlay]');
  const dialog = $('.auth-dialog') || $('.auth-page-card');
  if (!dialog) return;
  const form = $('[data-auth-form]', dialog);
  const emailInput = $('input[name="email"]', dialog);
  const status = $('[data-auth-status]', dialog);
  const dashboardLink = $('[data-auth-dashboard]', dialog);
  const openers = $$('[data-signin-open]');
  const closeButton = $('[data-auth-close]', dialog);
  const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  let returnFocus = null;
  const setStatus = (message, kind = '') => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('is-error', 'is-success');
    if (kind) status.classList.add(kind);
  };
  const open = () => {
    if (!overlay) return;
    returnFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    setStatus(config.mode === 'preview' ? 'Preview mode is ready. No account or password is stored.' : 'Choose a provider to continue.');
    window.setTimeout(() => emailInput?.focus(), 30);
  };
  const close = () => {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('modal-open');
    returnFocus?.focus();
  };
  openers.forEach(button => button.addEventListener('click', open));
  closeButton?.addEventListener('click', close);
  overlay?.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const focusable = $$('button, input, a[href]', dialog).filter(node => !node.hidden && !node.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const email = String(emailInput?.value || '').trim();
    if (!validEmail.test(email)) { setStatus('Enter a valid email address to continue.', 'is-error'); emailInput?.focus(); return; }
    if (config.mode === 'magic-link' && config.magicLinkEndpoint) {
      setStatus('Requesting a secure sign-in link…');
      try {
        const response = await fetch(config.magicLinkEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) throw new Error(payload.message || 'The sign-in link could not be requested.');
        setStatus('Check your inbox for the secure sign-in link.', 'is-success');
      } catch (error) { setStatus(error.message || 'The sign-in link could not be requested.', 'is-error'); }
      return;
    }
    if (dashboardLink) dashboardLink.hidden = false;
    setStatus('Preview sign-in accepted. Continue to the synthetic workspace below.', 'is-success');
  });
  $$('[data-auth-provider]').forEach(button => button.addEventListener('click', () => {
    const provider = button.getAttribute('data-auth-provider');
    const clientId = provider === 'google' ? config.googleClientId : config.microsoftClientId;
    if (clientId && config.mode === 'oauth') {
      setStatus(`${provider[0].toUpperCase()}${provider.slice(1)} sign-in is ready once its callback route is configured.`);
      return;
    }
    setStatus(`${provider[0].toUpperCase()}${provider.slice(1)} sign-in needs an OAuth client ID for agentichft.online. Use preview email sign-in for now.`, 'is-error');
  }));
})();
