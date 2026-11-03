# Security policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Report it privately to [tanayagarwal@agentichft.online](mailto:tanayagarwal@agentichft.online) with the affected URL or file, reproduction steps and expected impact. Do not include credentials or sensitive personal data.

## Repository rules

- Never commit passwords, SMTP settings, API keys, OAuth client secrets, session secrets or private contact-rate data.
- Keep production contact configuration outside the web root. See [CONTACT-SETUP.md](CONTACT-SETUP.md).
- Public browser configuration may contain only public identifiers. `assets/auth-config.js` must remain in preview mode until the identity provider flow has been fully implemented and reviewed.
- This site does not process trading instructions or connect to financial accounts. Do not add such capability without a separately reviewed backend and security design.
