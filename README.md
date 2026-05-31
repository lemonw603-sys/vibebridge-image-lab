# VibeBridge Image Lab

VibeBridge Image Lab is the official image generation workbench for VibeBridge users.

## Usage model

- Users enter their own VibeBridge/New API Key.
- Default API URL is `https://api.vibebridge.top/v1`.
- Quota, model allowlist, pricing, and logs are owned by New API.
- Image history is stored in the user's browser.

## Non-goals

- No Image Lab login in M1.
- No independent wallet or recharge.
- No cloud gallery or long-term image hosting.
- No unrestricted API proxy.

## Development

```bash
npm install
npm run build
npm test
```

## Deployment

M1 target: Cloudflare Pages static deployment on `image.vibebridge.top`.
