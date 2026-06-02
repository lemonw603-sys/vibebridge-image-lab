# Security Policy

VibeBridge Image Lab is a browser-based image generation workspace. The app is designed so users provide their own API key in the browser, and the default build must not contain upstream keys, payment keys, admin tokens, or operator bearer tokens.

## Reporting a Vulnerability

Please do not open a public issue that includes secrets, private API URLs, access tokens, account identifiers, or screenshots that expose credentials.

If you believe you found a vulnerability, contact the maintainers privately first. Include:

- A short description of the issue and impact.
- Reproduction steps using test keys or redacted values only.
- The affected version, commit, deployment type, browser, and operating system.
- Any console or network logs after removing keys, tokens, cookies, and user data.

## Sensitive Data Rules

Do not commit or paste:

- VibeBridge, OpenAI, FAL, or other provider API keys.
- New API admin tokens.
- Payment, webhook, or deploy-hook secrets.
- Cloudflare, Vercel, GitHub, or registry credentials.
- Browser storage exports from a real account unless keys and generated images have been removed.

Local-only files such as `.env`, `dev-proxy.config.json`, `.wrangler/`, `dist/`, and `node_modules/` must stay out of Git.

## Maintainer Checklist

Before making this repository public or cutting a release:

- Run a secret scan against the working tree and Git history.
- Verify `npm test` and `npm run build` pass.
- Confirm the default API key is empty.
- Confirm the default API URL points only to `https://api.vibebridge.top/v1` or a documented local development proxy.
- Confirm proxy mode is disabled unless a separate reviewed proxy design has been approved.
- Review generated artifacts and screenshots for keys, tokens, account IDs, and private URLs.

## Deployment Security Notes

The static app should be served with conservative browser security headers. Docker/Nginx deployments include `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Permissions-Policy` headers. If deployed through Cloudflare Pages, GitHub Pages, Vercel, or another edge, configure equivalent headers there as well.
