# Aegis Quant website

The public website for **Aegis Quant**, a product vision for transparent market research, cost-aware analysis and accountable simulation. It includes a one-page landing experience and an interactive dashboard populated exclusively with synthetic fixtures.

**Live site:** https://agentichft.online
**Dashboard:** https://agentichft.online/dashboard/

> This repository is a website demonstration, not a trading platform. It does not connect to exchanges, brokers, market-data providers, AI agents, account systems, or live order routing. It is not investment advice.

## What is included

- Landing page covering the proposed mission, vision, objectives, workflow and product boundaries.
- Accessible interactions: progressive scroll reveal, reduced-motion support, guided workflow, product/audience selectors, sign-in preview and contact-form preview.
- A 12-view dashboard with synthetic market, research, risk, execution and analytics examples.
- Static HTML, CSS and JavaScript with local SVG assets; no build system or runtime dependency is required.
- A PHP contact endpoint prepared for future Hostinger deployment. It remains inactive without private SMTP configuration.

## Repository layout

```text
.
├── index.html                 # Landing page
├── signin.html                # Preview-only sign-in screen
├── assets/                    # Landing-page styles, scripts and public configuration
├── dashboard/                 # Interactive synthetic dashboard
│   ├── index.html
│   └── assets/
├── api/contact.php            # Optional contact-delivery endpoint
├── server-config/             # Safe templates only; never publish real configuration
├── AUTH-SETUP.md              # Steps for production authentication
├── CONTACT-SETUP.md           # Steps for secure contact delivery
├── DEPLOYMENT.md              # Netlify and domain deployment runbook
└── QA-REVIEW.md               # Verification scope and limits
```

## Run locally

No installation is required. Serve this directory from a local HTTP server so browser navigation and form readiness behave normally.

```powershell
cd outputs/aegis-landing
py -m http.server 4173
```

Then open `http://localhost:4173/`. Stop the server with `Ctrl+C`.

To verify JavaScript syntax without starting a server:

```powershell
node --check assets/landing.js
node --check assets/auth.js
node --check dashboard/assets/app.js
node --check dashboard/assets/demo-data.js
```

## Production status

The static site is deployed through Netlify. `agentichft.online` is the public custom domain and Netlify serves the dashboard at `/dashboard/`.

Authentication is deliberately set to `preview` mode. The contact UI can validate and preview an enquiry, but direct email delivery is not enabled until the private Hostinger PHP/SMTP setup in [CONTACT-SETUP.md](CONTACT-SETUP.md) has been completed and delivery is verified.

## Working safely

- Keep every synthetic-demo, research-only and no-live-order disclosure intact.
- Do not add API keys, mailbox passwords, private SMTP files, Composer `vendor/`, or contact-rate data to Git.
- Keep real contact configuration outside the web root. `server-config/contact-config.example.php` is a template only.
- Do not enable live authentication until redirect URIs, session handling, sign-out and failure cases are tested on the HTTPS domain.

## Documentation

- [Deployment runbook](DEPLOYMENT.md)
- [Contact delivery setup](CONTACT-SETUP.md)
- [Authentication setup](AUTH-SETUP.md)
- [Brand and specification basis](BRAND-BASIS.md)
- [Quality-assurance review](QA-REVIEW.md)
- [Contribution notes](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Push this repository

From this directory, create the first commit and connect your remote:

```powershell
git add .
git commit -m "Initial Aegis Quant website"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/aegis-quant.git
git push -u origin main
```

Replace the example remote URL with the repository URL created in your Git host. Review `git status` before every commit; the included `.gitignore` protects common secrets and generated files but cannot guarantee that sensitive information was never added manually.

## License

This project is currently private and unlicensed for reuse. See [LICENSE.md](LICENSE.md).
