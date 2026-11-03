# Aegis Quant sign-in setup

The landing page now includes a sign-in modal and a standalone `signin.html` page. They run in **preview mode** until a real identity provider is chosen. Preview mode validates an email locally and reveals the synthetic dashboard link; it does not create an account or store a password.

## Recommended production path

Use one managed identity provider with passwordless email magic links and Google OAuth. This keeps password handling outside the Aegis Quant codebase, supports account recovery, and lets the provider enforce verification and abuse controls.

Before enabling live sign-in:

1. Create the provider project and register `https://agentichft.online/` and `https://agentichft.online/signin.html` as approved origins.
2. Register the provider callback route on the Hostinger server and decide whether successful users enter the dashboard or a future account home.
3. Place only public client identifiers in `assets/auth-config.js`; keep client secrets and token exchange logic on the server.
4. Change `mode` from `preview` only after the callback, session, sign-out and failure paths have been tested on the live HTTPS domain.

The current provider-neutral configuration is in `assets/auth-config.js`. The interface includes Google and Microsoft buttons so the chosen provider can be wired without changing the page structure. Do not paste private keys or client secrets into this folder or into browser code.
