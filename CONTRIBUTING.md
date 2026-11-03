# Contributing to Aegis Quant website

## Scope

Keep changes within the website-demo scope. The dashboard is a synthetic, static demonstration; do not present sample data as live prices, returns, connected agents, broker integration or execution capability.

## Before opening a pull request

1. Serve the site locally and check the landing page, sign-in preview and at least the dashboard overview, market monitor and scanner.
2. Run the JavaScript syntax checks listed in [README.md](README.md).
3. Test the changed interaction with keyboard navigation where it contains a button, input, dialog or filter.
4. Preserve reduced-motion behavior and the synthetic-demo disclosures.
5. Do not commit secrets, personal mailbox passwords, provider keys, production SMTP configuration, Composer dependencies or copied third-party assets.

## Source of truth

- Edit the landing page in `index.html` and `assets/`.
- Edit the dashboard in `dashboard/index.html` and `dashboard/assets/`.
- Treat `server-config/contact-config.example.php` as a redacted template. Private deployment configuration belongs outside this repository and outside the web root.

## Commit guidance

Use focused commits such as `docs: clarify deployment`, `fix: restore dashboard navigation` or `feat: add workflow step`. Describe any change to disclosures, contact behavior or authentication mode in the pull request.
