# VBK — Vibe Bug Kontrol development

The owner renamed the business to VBK (Vibe Bug Kontrol). Use VBK as the short brand and Vibe Bug Kontrol as its full name. Keep existing technical integration keys and identifiers compatible.

Continue this existing project. Keep the Site ID and the current public audience, as requested by the owner. The owner has stopped using Wix. Do not create replacement Sites or export ZIP files for each revision; export a portable project only when requested.

Preserve the forest-green, ivory and lime visual identity, self-hosted fonts, responsive layouts and reduced-motion support. The homepage and shared shell live in `content/*.html`, server pages in `app/`, page definitions in `lib/pages.mjs`, and public styles/interactions/assets in `public/`.

All customer-facing pages must be server-rendered with a unique title, description, self-canonical, one H1, Open Graph metadata and real internal links. The owner has explicitly enabled indexing: public pages use index/follow and robots allows crawling. Do not restore the old preview indexing gate. Do not invent addresses, service areas, reviews, guarantees, certifications, prices, phone numbers or social profiles.

Public contact details come from `content/business.json`; unresolved placeholders must not become links or schema facts. The owner confirmed Mumbai and Thane, including the commercial premises types in `lib/commercial-services.mjs`, on 23 November 2026. MIDC enquiries need exact site details; do not invent a branch or industrial-unit address. Further locations and additional services need explicit content records. Enquiries use the server-only recipient selection in `app/api/enquiries/route.ts`. Browser requests use `/api/enquiries`; email credentials belong only in runtime secrets or an ignored local environment file. Provider acceptance is submission acknowledgement, not proof of inbox delivery. Never send a live test enquiry unless the user requests one. Preserve entered details on failure and offer a populated mailto fallback.

The public FormSubmit flow validates through the server, then uses browser fetch to the fixed FormSubmit `/ajax/` endpoint. Do not restore PROVIDER_HANDOFF navigation. Require an explicit provider acknowledgement; activation messages are failures. Keep visible status/reference and Call/WhatsApp/email fallbacks. An empty owner-configured CC list is valid.

The optional Google Sheets register is server-only, configured by GOOGLE_SHEETS_WEBHOOK_URL and GOOGLE_SHEETS_WEBHOOK_TOKEN. It remains off until the owner's Apps Script deployment is supplied. Keep its token out of browser code, form fields, Sheets cells and Git. A register write records a validated enquiry, not email receipt; failure must not block email delivery.

Run appropriate tests and a production build after server or routing changes. Use the Sites build/source helpers when publishing. Use only supported browser automation; if browser QA is blocked, document the limit and continue source and server checks. Keep analytics off until a real measurement/container ID and consent are present; never send form contents to analytics.

This branch is the explicitly requested isolated staging environment. Its `.openai/hosting.json` belongs to staging. Publish this branch only to that staging Site, with `SITE_ENV=staging` and its own `SITE_URL`. The separate production Site must not be replaced or republished by a staging-only task. Preserve each branch's deployment identity. The indexing rule above applies to production; staging remains private and excluded from search.
