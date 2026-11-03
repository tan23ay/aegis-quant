# Deployment runbook

## Current public deployment

- Production URL: `https://agentichft.online`
- Hosting: Netlify static-site deployment
- Custom domain: `agentichft.online`
- Dashboard path: `/dashboard/`
- TLS: managed by Netlify for the connected custom domain

The Hostinger domain points to the Netlify-hosted site. The website source stays in this repository; Hostinger mailbox/SMTP configuration is only required when contact-form delivery is deliberately activated.

## Publish an update through Netlify

1. Review the change locally using the server command in [README.md](README.md).
2. Run the syntax checks and verify any changed interactive flow.
3. In Netlify, open the `precious-griffin-ea38fd` project and deploy the contents of this repository as a static site. Keep `index.html`, `assets/`, `dashboard/`, `signin.html` and `api/` in their existing relative locations.
4. Confirm the deployed preview URL first, then verify `https://agentichft.online` and `https://agentichft.online/dashboard/` in a fresh browser session.
5. Check that CSS, JavaScript, icons, all dashboard views and the synthetic-demo notices load correctly.

## Contact-delivery deployment

Netlify static hosting does not run the PHP endpoint in `api/contact.php`. To enable the contact form, host that endpoint on a PHP-capable environment and follow [CONTACT-SETUP.md](CONTACT-SETUP.md). Keep its SMTP configuration, Composer vendor directory and rate data private and outside the public web root.

Until that work is complete, the contact form must remain in preview mode and offer the published email address as the contact path.

## Rollback

Use Netlify’s deploy history to restore the last verified deploy. After a rollback, recheck both the root page and dashboard path on the custom domain.
