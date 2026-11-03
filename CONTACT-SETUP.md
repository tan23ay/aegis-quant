# Contact form activation — agentichft.online

The form is prepared to deliver enquiries to **tanayagarwal@agentichft.online**. It is **not active until private SMTP configuration and dependencies are installed on the hosting account**. No credentials or PHPMailer vendor files are included in this review package. The available Hostinger Mail connector cannot upload this endpoint or configure hosting secrets.

## Hosting requirements

- PHP 8.2 or newer, with OpenSSL, mbstring, session support and writable private storage.
- HTTPS on `https://agentichft.online`, with PHP able to detect the HTTPS request. Use the hosting account's trusted HTTPS configuration; never trust arbitrary forwarded headers in the endpoint.
- An active Hostinger mailbox. The example uses `tanayagarwal@agentichft.online` as both authenticated sender and fixed recipient. If another authenticated mailbox on `agentichft.online` is used, change both `smtpUsername` and `fromEmail` in private configuration; the recipient stays fixed in the endpoint.
- Composer on the server or another PHP build environment to install the pinned dependency. A static hosting service that does not execute PHP cannot run this endpoint.

## Safe deployment layout

Treat the package as a **review/source package**, not a ZIP to blindly extract into `public_html`. Publish only the website's HTML/assets/dashboard files plus `api/contact.php` under `public_html`. Do not publicly upload `server-config`, this guide, real secrets, dependency manifests or the private rate directory. Example server layout:

```text
/home/ACCOUNT/domains/agentichft.online/
├── public_html/
│   ├── index.html
│   ├── assets/
│   └── api/contact.php
└── private-aegis/
    ├── contact-config.php
    ├── composer.json
    ├── composer.lock       # Generated when Composer installs the pinned package.
    ├── vendor/
    └── contact-rates/
```

Replace `ACCOUNT` with the real path shown in hPanel. Create `private-aegis/contact-rates` outside the web root and grant only the hosting PHP user access. Recommended private directory permissions are `0700`; configuration and rate files are `0600` when supported. The endpoint rejects private configuration, dependencies or rate storage located inside the web root, including symlinks that resolve there.

## Configure privately

1. Copy `server-config/composer.json` into `private-aegis`. In that directory run `composer install --no-dev --prefer-dist --optimize-autoloader`. Retain the generated lock file for subsequent installs and run `composer audit` before production deployment. Dependencies are deliberately not downloaded or bundled here.
2. Copy `contact-config.example.php` into `private-aegis/contact-config.php`. Set the actual mailbox password **in the hosting environment**, not in chat. This is the mailbox password, not the Hostinger account password.
3. Generate a random rate secret in the private directory with `php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'` and enter the result as `rateSecret`. Do not reuse an account password. Check that `autoload` and `rateDirectory` resolve to the private paths above.
4. Set the server environment variable `AEGIS_CONTACT_CONFIG` to the absolute path of `private-aegis/contact-config.php`. Use the hosting account's supported PHP/Apache environment configuration or obtain Hostinger support assistance. Do not embed the path or password in browser code. If `getenv('AEGIS_CONTACT_CONFIG')` is unavailable on the chosen plan, resolve that hosting configuration before activating the endpoint.
5. Keep `allowedOrigins` set to `['https://agentichft.online']`. Add the exact `https://www.agentichft.online` entry only if HTTPS and the www site are intentionally enabled. An HTTP origin, alternate domain or arbitrary preview origin is rejected.
6. Use port `465` and `smtps`, or port `587` and `starttls`, together. TLS certificate validation stays enabled. Enable Hostinger's recommended domain email authentication for the mailbox through hPanel.

Hostinger's official settings specify `smtp.hostinger.com` with implicit TLS on port 465 and provide port 587 with STARTTLS as the alternative. See [Hostinger email configuration](https://www.hostinger.com/support/4305847-set-up-hostinger-email-on-your-applications-and-devices/) and the [official PHPMailer usage guide](https://github.com/PHPMailer/PHPMailer). The dependency is pinned to [PHPMailer 7.1.1](https://github.com/PHPMailer/PHPMailer/releases/tag/v7.1.1), checked against the official release listing on 10 October 2026. PHPMailer uses the [LGPL 2.1 license](https://github.com/PHPMailer/PHPMailer/blob/v7.1.1/LICENSE); Composer supplies its license with the installed package. Preserve that license when distributing dependencies.

## Readiness and request contract

`GET /api/contact.php` returns JSON with `ready` and `csrfToken`. With complete private configuration, dependencies and writable rate storage it returns HTTP 200 with `ready: true`. **This checks local configuration, not SMTP login or inbox delivery.** Unconfigured installations return HTTP 503 with `ready: false` and an email alternative; no form submission is reported as sent.

The browser sends `POST /api/contact.php` with `Content-Type: application/json`, `X-CSRF-Token` from GET, and same-origin session cookies. The JSON body is:

```json
{"name":"Visitor name","email":"visitor@example.com","topic":"Research collaboration","message":"A message with at least twenty characters.","website":"","consent":true}
```

The complete body is limited to 8 KB. Name is 2–100 characters, topic 2–80, email at most 254 bytes, and message 20–3000 characters. Header fields cannot contain newlines or control characters. `website` is the empty honeypot field; an occupied honeypot returns a rejection, not a false success. Consent must be a JSON boolean `true`. The endpoint uses the authenticated company sender and validated visitor address only as Reply-To. Visitors cannot set recipients, SMTP settings or subjects.

Persistent, file-locked rate storage permits at most five attempts per IP in one hour and at least 30 seconds between attempts. It records only secret-derived HMAC identifiers and timestamps, with no raw IP addresses or message content. It does not trust visitor-supplied forwarding headers. Configure a daily hosting maintenance job to remove only `.json` rate records older than 24 hours from the verified private `contact-rates` directory. If the site is placed behind a proxy, configure trusted client addressing at the hosting layer before relying on this IP limiter.

## Activation checks after approval

1. On the hosting account, run `php -l public_html/api/contact.php` and `php -l private-aegis/contact-config.php`, then verify Composer's platform requirements and audit result.
2. Load the HTTPS page and check the GET readiness response. No secrets should appear. Confirm that contact readiness is false before configuration and true after local prerequisites are complete.
3. Test rejected inputs, missing consent, a populated honeypot, expired/missing token, wrong origin, oversized input and repeat attempts. These tests must not produce email.
4. Only after the user approves activation, send one clearly labeled test enquiry from the public form and confirm receipt in the mailbox. Success means the SMTP server accepted the message for delivery; spam placement, later bounces or inbox receipt are separate checks. Do not claim the contact form active based only on readiness.

The endpoint's error responses suppress exception details, SMTP diagnostics and secrets. The endpoint itself does not save enquiries; hosting access logs and the destination mailbox can retain data according to their settings. Review the public privacy wording and mailbox retention policy before accepting real enquiries.

## Current verification status

Source and request contract reviewed. The supplied Windows environment has no available PHP runtime, so PHP lint/execution and live SMTP delivery have **not** been verified here. No actual emails were sent. Browser mock responses can verify display behavior only, not server execution, authentication or email delivery.
