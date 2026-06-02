# Public Release Checklist

Use this checklist before changing the GitHub repository visibility to public, creating a release, or submitting the project to an open source program.

## Secret Safety

- [ ] `git status --short` contains only intentional files.
- [ ] No `.env`, `dev-proxy.config.json`, `.wrangler/`, `dist/`, browser exports, screenshots with keys, or local notes are staged.
- [ ] Working tree secret scan is clean.
- [ ] Git history secret scan is clean, or any historical secret has been revoked and rotated.
- [ ] README, docs, issue templates, and examples use fake or redacted credentials only.
- [ ] GitHub Actions secrets are referenced only as `${{ secrets.NAME }}` and never as literal values.

## Project Readiness

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Default API key is empty.
- [ ] Default API URL is `https://api.vibebridge.top/v1` unless a release note explains otherwise.
- [ ] API proxy mode is disabled for public deployments unless separately reviewed.
- [ ] `LICENSE`, `README.md`, `CONTRIBUTING.md`, and `SECURITY.md` are present.
- [ ] Issue templates warn users not to paste secrets.

## GitHub Metadata

- [ ] Repository description explains the project in one sentence.
- [ ] Topics include relevant tags such as `image-generation`, `openai-compatible`, `vite`, `react`, and `typescript`.
- [ ] GitHub profile visibility is public enough for reviewers to verify maintainer identity.
- [ ] The first public release has a tag and release notes.

## Codex for Open Source Application

- [ ] Repository visibility is public.
- [ ] Applicant is listed as a primary or core maintainer.
- [ ] Application text honestly describes adoption metrics and ecosystem value.
- [ ] OpenAI organization ID, ChatGPT account email, and personal name are filled by the applicant.
