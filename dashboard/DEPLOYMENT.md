# Dashboard deployment note

## Current status

**The dashboard is deployed as part of the public Aegis Quant site.** The live dashboard is available at `https://agentichft.online/dashboard/` through Netlify. The Hostinger domain is connected to Netlify; do not upload this standalone dashboard package to Hostinger unless the hosting architecture changes.

The dashboard remains a static synthetic demonstration. Use the repository-level [deployment runbook](../DEPLOYMENT.md) for the active Netlify deployment path.

The separate `aegis-quant-hostinger.zip` contains exactly `index.html`, `.htaccess` and `assets/` at the archive root. Extract its contents into the verified domain document root. `.htaccess` provides directory-index and security-header settings for compatible Apache/LiteSpeed hosting; confirm compatibility when publishing.

## Legacy Hostinger static-hosting notes

1. Confirm the correct Hostinger hosting account, **agentichft.online** domain assignment and its document root. Do not assume that one account's `public_html` is the correct location for this domain.
2. Check the existing website and preserve a recoverable backup of its files and relevant hosting configuration before replacing anything. Keep that backup outside the public web root.
3. Upload the contents of `index.html` and the complete `assets/` directory to the chosen document root. Preserve the relative directory structure and filenames. The URL should serve the entry page directly at `https://agentichft.online/`.
4. Enable or verify a valid certificate and HTTPS. Check that the domain points to the intended hosting service; change DNS only if needed and authorized for that account.
5. Verify the deployed page over HTTPS, reload from a fresh browser session, and inspect desktop and mobile views. Check navigation, assets, search, opportunity details, predefined scenarios, simulated order preview, risk pause, watchlist preferences and sample exports.
6. Confirm that the persistent Tier A, synthetic-demo and research-only notices are visible. Verify that all integrations remain accurately marked as unconnected and that the page exposes no credentials or real order-submission path.
7. If the deployment fails, restore the saved website backup and report the failure. Do not leave a partially replaced site serving broken files.

Hostinger's actual account interface and available tools must be inspected when deployment begins. These steps describe the required outcome and do not claim a hosting connection has already been established.

## Hosting contents

Required public files:

```text
index.html
assets/
```

`package.json`, `server.mjs`, `README.md`, `DEPLOYMENT.md` and review notes are optional local handoff material. They are not required to serve this static website, and a Node.js application hosting plan is not required for the prepared frontend.

## Scope after publication

Publishing the website makes this synthetic demonstration accessible on the requested domain. It does not add authentication, licensed feeds, broker connectivity, trading authority, model training, a database or production risk and accounting services. Those require a separately designed and verified backend. Keep the site's demo disclosures in place after deployment.

## Historical deployment record

This record applies only if the deployment architecture moves from Netlify to a Hostinger document root:

- Published URL:
- Publication date and time:
- Hosting account and document root confirmed:
- Existing-site backup location:
- HTTPS verified:
- Browser checks completed:
- Rollback procedure confirmed:
