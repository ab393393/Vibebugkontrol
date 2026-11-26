# VBK — Vibe Bug Kontrol

A server-rendered pest control website for Mumbai, built with React,
TypeScript and Vinext. The established forest green, ivory and lime design,
self-hosted fonts, WebP illustrations, responsive layouts and reduced-motion
support are retained. Wix is not required.

## Run locally in VS Code

Use Node.js 22.13 or later (Node 24 is suitable) and the pinned package manager:

```sh
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed by the development server, normally port 5173.
The clean export defaults to the portable execution profile. Do not copy an
old managed execution-profile file or local credentials into the export.
For optional runtime settings, copy `.env.example` to `.dev.vars` and replace
placeholders. On Windows use `Copy-Item .env.example .dev.vars` in PowerShell.

Edit `content/business.json` for public business details. Edit `content/` for
the original page shell/homepage, `lib/service-articles.mjs` for service copy,
`public/knowledge-content.mjs` and `public/launch-guides.mjs` for guides, and
`components/` for server-rendered page structures. Local changes do not need
another ZIP. Source CSS/JS changes rebuild the combined public assets and reload
the local development page.

```sh
pnpm test
pnpm check
pnpm build
pnpm start
```

`pnpm start` serves the built Worker locally. No API credentials are shipped.

## Business and domain configuration

`content/business.json` is the single public profile. Unresolved placeholders
are omitted from published phone links, email, address, map, hours, trust claims
and schema. A valid domain there takes priority over runtime `SITE_URL`. The
current hosting URL is a runtime setting, never embedded in source. A real custom
domain must also be connected to the host/DNS; editing metadata alone does not
register a domain or move hosting.

All public content pages use index/follow. `robots.txt` permits page crawling and
lists the canonical sitemap; API and sign-in routes are excluded. The old preview
indexing gate has been removed at the owner's request. This does not establish
that a search engine has indexed or ranked a page.

Read `docs/LAUNCH.md` for the remaining business inputs and all 25 request items.
Draft templates for a neighbourhood and an additional service are in `docs/`.
Do not publish example places, prices, reviews or credentials as facts.

## Pages and SEO

The current registry contains 25 public content pages, plus any approved area,
additional service or original research records added later. Home and service
pages have Mumbai titles, descriptions, H1s and introductory copy. The four
existing service pages have 550+ words each covering observations, a discussion
of methods, safety, follow-up, FAQs and a real quote link. Methods and outcomes
are not guaranteed before assessment.

Every page has a unique title/description, one H1, a canonical URL and Open Graph
and Twitter metadata. Inner pages have visible breadcrumbs and BreadcrumbList
schema. Service pages and the AMC page include Service schema. FAQPage schema
is restricted to the FAQ page and matches visible answers. Organization,
LocalBusiness and WebSite data use the shared business profile. LocalBusiness is
used with Service/serviceType for pest care. Full address/contact fields await the owner's facts.
No customer ratings or credentials are fabricated.

`/quote` has a native HTML form and progressively enhanced submission. The
homepage/header/footer quote controls are real links, even without JavaScript.
Call and WhatsApp links appear in the header, hero, footer and mobile bar after
valid international numbers are supplied. Without a number, a real callback
request link remains available. The footer and schema share the same published phone and address values.
The location map is lazy-loaded only after a real Google Maps embed URL is set.

`/commercial/amc` covers scheduled-service discussions, emergency request terms,
add-ons, records and quotation scope. No specific frequency, emergency response,
starting price or contract term is assumed. `/pest-library`, guides and related
reading connect the topics and services. `/research` retains an honest separation
between public references and unpublished original data; see `docs/RESEARCH.md`.
A branded 404, 301 aliases and `/privacy-policy` remain in place.

## Performance and assets

The four maintained CSS source files are combined/minified into `public/site.css`.
A selected critical subset is inlined from `public/critical.css`. The remaining
stylesheet is one regular stylesheet request to preserve rendering order. The
browser modules are bundled/minified into `public/site.js`, loaded as a deferred
ES module. Initial hero opacity animations were removed to keep primary content
visible. No new motion library was added. Native features and form submission do
not depend on the script loading first.

Existing responsive WebP images retain alt text, dimensions, eager priority for
the hero and lazy loading below the fold. SVG, PNG favicon, apple touch icon,
192/512 PNG icons and the web manifest are included. Assets regenerate via
`scripts/prepare-public.mjs`; the PNG files are checked into source and require
no image conversion tool on your local machine.

Core Web Vitals have not been measured. Browser visual QA and real-phone testing
remain pending because the managed browser could not access the preview. Static
asset sizes, server rendering and code tests are not Lighthouse or field scores.
After the domain is confirmed, measure mobile/desktop PageSpeed and real-user
LCP, INP and CLS; use Search Console when enough traffic data is available.

## Tracking and enquiry delivery

GA4, GTM and Search Console placeholders are in `.env.example`. Valid IDs enable
the corresponding metadata/snippets. No Google script loads before analytics
consent, and Global Privacy Control keeps tracking off. GTM takes priority if
both IDs are supplied, avoiding a second direct GA4 installation. Configure the
GTM container for analytics, with consent checks and sanitized page_location/
page_referrer fields; do not add form values or personal data to tags. Withdrawal
reloads an already-loaded GTM runtime after saving the declined preference.
No GTM noscript pixel is emitted before consent.

The quote/contact endpoint supports JSON and native URL-encoded POSTs with the
same validation, request-size/origin checks, honeypot, basic per-isolate abuse
limit and provider acknowledgement requirement. Native failures preserve escaped
input in a retry form. The backend uses `ENQUIRY_TO` when explicitly configured, otherwise the public
business email. Missing or invalid configuration fails without sending to an old
inbox. The current interim contact and enquiry recipient is
`kardaksamiksha4@gmail.com`; the official email can replace it later in
`content/business.json`. Call and WhatsApp use +91 82916 89183. API keys stay on the server.
Enquiry copies go to `abhishek.bhole123@gmail.com`, configured in
`content/enquiries.json` under `cc`. The main public email and schema remain
unchanged. Copies use FormSubmit's documented `_cc` field, Resend's `cc` array,
and the prepared direct-email fallback. Submitted `to`, `cc` and `_cc` fields
cannot change the server's recipient configuration. Copies are validated and
deduplicated; invalid configuration fails before delivery.

Default public-email delivery validates on the server and returns a 202
`PROVIDER_AJAX` preparation response. The browser then sends the checked fields
with `fetch` to `https://formsubmit.co/ajax/<recipient>`, with JSON Content-Type
and Accept headers. There is no external form POST, navigation or hidden iframe.
Preparation never counts as success. HTTP success plus an explicit provider
success acknowledgement is required before the on-page success message or lead
event. Activation-related replies remain failures even if they say success=true.
Native forms without JavaScript use server-side AJAX and an on-site receipt.
CAPTCHA is not explicitly disabled. Failed or unreadable provider replies,
timeouts and network/CORS errors preserve the details and show an error plus
Call +91 82916 89183, WhatsApp and prepared email fallback links.

Each validated submission gets an `SS-` reference in its status, subject and
email content. States distinguish checking, sending, accepted and failed, with
failure codes for diagnosis. Search both inboxes for the displayed reference to
confirm receipt. Provider acceptance alone is not proof of inbox delivery. An
empty CC array is valid and omits `_cc`/`cc` from outbound requests. No automatic
retry or public fake-success test mode is used.

Optional Resend needs a key and verified sender and keeps server-side delivery.
An explicit private routing override uses the server integration rather than
exposing a private address in browser form actions. Server-delivery failure logs
contain only provider/status/category information, never submitted fields.
Browser AJAX destinations and field names are checked before sending. FormSubmit activation and actual
inbox delivery remain unverified. Tests use injected provider responses, and no
live test email was sent for this change. Provider acceptance is not inbox proof.

## Validation and publication

The automated suite checks all registered pages, metadata, schemas, unique H1/IDs,
local copy, 400+ word service articles, links/anchors, crawl depth, assets, public
robots/sitemap settings, redirects/404, contact/schema consistency, conditional
maps/actions, native/JSON form delivery and failures, tracking consent, and the
original-research publication gates. TypeScript and the Sites production build
are required before publication. Keep the existing Site ID and public audience.
The downloadable ZIP contains source and assets, not dependencies, runtime
credentials, database contents, generated build output or Git credentials.

Optional Google Sheets enquiry register: see `integrations/google-sheets/README.md`
and the ready-to-paste `Code.gs`. The owner's supplied workbook has an Enquiries
tab and a Connection setup checklist. Configure the private runtime values
`GOOGLE_SHEETS_WEBHOOK_URL` and `GOOGLE_SHEETS_WEBHOOK_TOKEN` only after the owner
authorizes and deploys the Apps Script web app. The connector cannot deploy that
script. Without both settings the integration makes no Google request. Validated
leads are recorded independently of email acceptance, with typed India-time dates,
reference deduplication, literal text and a New follow-up status. A row does not
prove email receipt. No live lead was sent while preparing this integration.


Delivery settings, verified 24 October 2026: production environment revision 1
contains only SITE_URL. ENQUIRY_TO, RESEND_API_KEY and ENQUIRY_FROM are absent.
The API route therefore selects kardaksamiksha4@gmail.com from business.json,
CC abhishek.bhole123@gmail.com from enquiries.json, and formsubmitBrowser=true.
That flag now selects browser AJAX rather than the removed PROVIDER_HANDOFF
navigation. Neither address is a placeholder and both match the owner's input.
The earlier server delivery returned 502 in 844 ms; its upstream body was not
retained, so the original cause is unknown. Browser AJAX avoids that server hop.
Owner activation and inbox receipt remain unverified. Content-versioned assets
ensure the updated delivery code is loaded after publication.

FormSubmit owner setup: no account registration or API key is required for the
current integration. Open the published `/quote` page and submit once. Open FormSubmit's activation email in
`kardaksamiksha4@gmail.com` and activate the form if it is not already active;
check Spam as well as Inbox. Submit again after activation and verify the enquiry
in the main inbox and the CC inbox, `abhishek.bhole123@gmail.com`. Changing the main email later
requires activation for the new recipient. See https://formsubmit.co/ ,
https://formsubmit.co/documentation and https://formsubmit.co/help . Activation
and actual receipt in both inboxes are still unverified; no live email was sent
by Codex for this repair.

Owner test: send an enquiry with message “TEST — VBK delivery check”.
The page must stay on the VBK URL and show checking, sending, then
either “Sent — accepted for email delivery” with a reference, or a clear failure
with a code and contact alternatives. If activation is required, activate through
the primary inbox and repeat. Confirm the reference appears in both inboxes,
including Spam. To test failure without sending email, load the form first, set
the browser Network panel to Offline, and submit: success must stay hidden,
details must remain, and Call/WhatsApp/email alternatives must appear. Restore
Online afterward. The automated suite uses mocked provider replies and covers
activation, rejection, unreadable replies, timeout, network failure, no CC,
duplicate-click protection and retry. It does not prove live inbox receipt.

## Brand name

The business is VBK, short for Vibe Bug Kontrol. The visible brand, enquiry messages, page metadata and structured data use this name. Existing technical identifiers, token property names, fonts and the hosting URL retain their original names for compatibility.


## Content and enquiry refresh — 26 November 2026

The quote drawer and full-page quote/contact form share choices and a payload model in `public/enquiry-model.mjs`. Both include property size, premises type, care preference, PIN code and requested date/time. The drawer keeps its two-step presentation; callback links work as native `/quote?request=callback` links. Multiple pest choices survive both browser AJAX and native form POSTs. Empty optional fields remain valid. Idle delivery labels and empty receipt blocks are hidden; acknowledgement, failure, retry and call/WhatsApp/email fallbacks remain visible when needed.

Personal email meta tags and email fields in business JSON-LD are omitted. The interim public contact email remains visible in the footer/contact policy and remains the enquiry recipient. CC routing is still server-configured. Add the official business-domain email to structured data when the owner supplies it. The browser can read prepared FormSubmit delivery fields after server validation; FormSubmit routing addresses are not secrets.

Explicit business domain and runtime `SITE_URL` take priority. When neither is configured, the Worker uses the trusted request URL origin in request-local storage for canonical, social, schema and sitemap URLs. Forwarded Host headers are not used. `SITE_ENV=staging` disables indexing and disallows crawling.

The two planning guides are expanded checklists. The AMC page is shorter, the standards hub omits an empty research-publication section, and Indian FSSAI references are distinguished from general US educational guidance. No pricing, response hours, re-treatment policy, guaranteed outcomes, credentials, photos or reviews were invented. Those business facts remain pending owner input. Tests use mocks and do not send email or create Google Sheet rows.
