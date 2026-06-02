# Contributing

Thanks for helping improve VibeBridge Image Lab. This project accepts fixes that keep the app lightweight, safe for public deployment, and compatible with OpenAI-style image APIs.

## Local Development

```bash
npm install
npm test
npm run build
```

For local preview:

```bash
npm run preview -- --host 127.0.0.1
```

## Security Expectations

- Never commit API keys, admin tokens, payment secrets, deploy hooks, cookies, or private account data.
- Use fake or redacted values in tests, issues, screenshots, and logs.
- Keep the default API key empty.
- Do not enable a public API proxy without a separate design review.
- Treat browser storage exports as sensitive because they may contain user API keys and generated image history.

## Pull Requests

Before opening a PR:

- Search existing issues and PRs to avoid duplicate work.
- Keep changes focused and explain the user-visible behavior.
- Add or update tests for behavior changes.
- Run `npm test` and `npm run build`.
- Check new docs, examples, and screenshots for sensitive data.

## Scope

The project may reject requests that primarily work around third-party proxy or relay services returning non-standard API responses. When possible, ask those services to follow the official-compatible API shape, or use custom provider configuration instead of adding one-off compatibility code.
