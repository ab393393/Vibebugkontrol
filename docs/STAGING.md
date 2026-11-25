# VBK staging

Source: https://github.com/ab393393/Vibebugkontrol

- `main`: production-compatible application, with the existing production Site identity.
- `staging`: same application, with the separate staging Site identity in `.openai/hosting.json`.
- Staging: https://vbk-staging.abhishek-bhole123.chatgpt.site
- Live business site: https://shield-and-shine.abhishek-bhole123.chatgpt.site

Staging is private to the owner. Sign in using the same ChatGPT account to review it.
It is an isolated hosted deployment, not a new address for the live business site.

## Environment

Only staging sets `SITE_ENV=staging`. `SITE_URL` is its own staging origin.
In this mode, page metadata uses `noindex, follow`, robots disallows crawling and
the sitemap is empty. Production defaults to index/follow and keeps its normal
sitemap and business-domain precedence. Do not set staging mode on production.
These crawl settings are additional separation; private access controls protect
the staging site.

Runtime values and credentials are not stored in this repository. Google Sheets
and analytics are not configured on staging. The quote form retains its normal
email flow; actually submitting it can send email to the business inboxes. Do not
send test enquiries unless the owner requests a live delivery test.

## Review workflow

1. Clone the repository and use the `staging` branch for review changes.
2. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm check` and `pnpm build`.
3. Publish the checked staging source to its staging Site with the Sites workflow.
4. Review the staging URL, then promote approved application changes to `main`.
5. Keep each deployment's `.openai/hosting.json` project identity intact.

GitHub push does not automatically deploy either Site. No Actions deployment or
third-party hosting integration is configured. A future automated deployment
requires an explicitly configured hosting connection and credentials.

## Local development

Use Node.js 22.13+ and the pinned pnpm 11.25.0. Run `pnpm dev`; edits reload locally.
Use an ignored `.dev.vars` file for runtime settings. Never commit secrets,
`.dev.vars`, `node_modules`, build output or managed workspace state.
