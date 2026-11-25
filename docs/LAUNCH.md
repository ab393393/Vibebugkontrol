# Launch inputs and implementation checklist

Updated 24 October 2026. Mumbai has been confirmed in the brief. The owner has supplied +91 82916 89183 for calls and WhatsApp, and
kardaksamiksha4@gmail.com as the interim public/enquiry email. Other bracketed
business inputs are still unfilled. The code never publishes them as facts.

## Inputs needed from the owner

- Final domain and access to its DNS/hosting connection.
- Official business email when ready. The interim public and enquiry email is
  kardaksamiksha4@gmail.com; no separate routing override is currently configured.
- Enquiry CC is configured for abhishek.bhole123@gmail.com in content/enquiries.json.
  Activate FormSubmit through the main inbox, then verify actual receipt in both
  inboxes. No FormSubmit account registration or API key is required for this flow.
- Call and WhatsApp links are configured for +91 82916 89183, as supplied.
- Full business street address, Mumbai locality, six-digit PIN and opening hours.
- Actual Google Maps embed URL and Google Business Profile/social profile URLs.
- Exact Mumbai neighbourhoods served. Add unique local content before enabling
  area pages; Mulund is not treated as confirmed merely because it was an example.
- Other confirmed services and actual scope/methods, such as termite or ant care.
- License number, certification names, years of experience and any evidence the
  business approves for publication. Do not use the word licensed without proof.
- Genuine reviews and approved customer/client names. Client logos, if supplied,
  should have permission and appropriately sized WebP assets before adding them.
- Starting prices if public, applicable scope/taxes, and confirmed AMC frequency,
  emergency availability, add-ons and exclusions.
- GA4 measurement ID, GTM container ID if used, Search Console verification/DNS.
- Email provider activation and a separately authorised live delivery test.
- Public-domain browser, physical-phone and Core Web Vitals measurements.

## Where each request is handled

| # | Implementation | Input or verification still needed |
|---|---|---|
| 1 | Public metadata uses index/follow; old preview gate removed | Indexation itself is not guaranteed |
| 2 | Domain comes from business.json or runtime SITE_URL; internal links relative | Supply/connect actual custom domain; current public host remains the runtime origin |
| 3 | Schema email uses only configured business email | Interim email configured; official replacement later |
| 4 | Mumbai title, description, H1 and intro on homepage and service pages | None for the confirmed Mumbai scope |
| 5 | Shared LocalBusiness plus Service/serviceType, conditional contact/address/hours/images/price/social data | Phone, full address, hours, price range, areas and real profile URLs |
| 6 | Service on services/AMC, FAQPage on FAQ, breadcrumbs on inner pages | External rich-result validation after domain setup |
| 7 | Conditional native Call/WhatsApp links in header, hero, footer | Configured for +91 82916 89183 |
| 8 | Sticky mobile quote/callback bar becomes Call/WhatsApp/Get Quote when numbers are configured | Configured for +91 82916 89183 |
| 9 | Quote CTAs link to /quote; native HTML and JS form submission supported | Activate/verify email delivery |
| 10 | Footer and schema consume the exact same business profile | Full address; phone and interim email configured |
| 11 | Mumbai service-area section; lazy real-location map when configured | Confirmed areas and Maps embed URL |
| 12 | Three descriptive Mumbai service sections, why-choose copy and existing process | Publish starting prices only if supplied |
| 13 | /commercial/amc, main-nav link and contextual links | Confirm actual contract terms |
| 14 | Approved extra-service registry, routes, schema, links and sitemap integration | Confirm services and original content |
| 15 | Area registry, unique-content checks, native area links, pages and sitemap | Confirm neighbourhoods and local copy |
| 16 | Four current service pages have 550+ words, safety, method discussion, FAQ and quote CTA | Review/confirm operational methods and any actual promises |
| 17 | Conditional evidence/license/certification/review/client text | Genuine proof, permissions, optional logo assets |
| 18 | Expanded FAQ and cost/safety/duration guide | Actual pricing/outcome data if published later |
| 19 | GA4/GTM/GSC config placeholders, shared metadata, consent-gated scripts | Real IDs, container configuration and ownership verification |
| 20 | Dynamic robots.txt allows crawling and points to canonical sitemap.xml | Real domain for canonical launch |
| 21 | SVG and PNG favicon, apple touch icon, 192/512 PNGs, manifest | None |
| 22 | Unique metadata, one H1, canonical for all registered pages | Real custom domain |
| 23 | Branded HTTP 404, privacy page and footer link | Review actual business policy as details change |
| 24 | WebP, alt text, dimensions, responsive variants, appropriate loading | No new images required; genuine job photos await owner |
| 25 | Combined CSS, inline selected critical CSS, bundled/deferred JS, visible hero | Browser/PageSpeed and real-user CWV results remain pending |

## Add a real service area

Use docs/service-area.template.json as a working draft. Set published to true
only for a confirmed neighbourhood with unique, useful local content and access
notes. Append it to content/service-areas.json. It then gets an /areas/<slug>
page, metadata, breadcrumb, service-area link and sitemap entry. No draft/example
area is public. Add confirmed area names without a page to business.json's
areaServed array if needed.

## Add another actual service

Use docs/additional-service.template.mjs as the shape reference. Add the completed
record to public/additional-services.mjs. A published service needs a unique id
and slug, a 90–180 character description, real introduction, 400+ words of original
sections, FAQs and credible sources. Set methods, safety and promises only after
business review. Its server page, service index links, metadata, schema and sitemap
are generated. An empty registry advertises no additional services.

## Tracking placeholders

The real shared snippets are in app/layout.tsx and public/privacy-controls.mjs.
Search Console verification uses generateMetadata().verification.google. The
placeholder strings in .env.example intentionally fail validation until replaced.
GTM takes priority over direct GA4; choose one deployment route to avoid duplicate
page views. Use consent-aware analytics tags and no personal/form variables.

## Verification limits

Passing source/SSR tests and a production build does not prove inbox receipt,
Google indexing, rich-result eligibility or Core Web Vitals. Current targets for
good field CWV are LCP <=2.5 seconds, INP <=200 milliseconds and CLS <=0.1 at the
75th percentile, evaluated separately for mobile and desktop. Measure after real
traffic and complete public-domain lab/device checks; no score is invented here.


## Form delivery repair — 24 October 2026

The owner reported the generic delivery failure and no received email. Native
hosting logs showed POST /api/enquiries returned 502 in 844 ms. The previous
code did not preserve the provider's reason; neither missing activation nor a
specific network block is asserted as the proven cause.

The public FormSubmit recipient now uses browser AJAX. The server validates the
enquiry, fixes the recipients and returns 202 PROVIDER_AJAX; the browser then
uses fetch to https://formsubmit.co/ajax/<recipient>. The removed PROVIDER_HANDOFF
branch cannot navigate visitors to FormSubmit. Native HTML forms use server AJAX
and a receipt on this domain. A 202 preparation response is not acceptance.
Success requires HTTP success plus an explicit provider acknowledgement; an
activation message remains a failure. Provider acceptance does not prove inbox
receipt. See https://formsubmit.co/ajax-documentation and
https://formsubmit.co/help .

Use the updated live form once and confirm the
activation email and actual enquiry arrive in kardaksamiksha4@gmail.com. If the
form displays an error, retain the visible status code and reference to diagnose it. No live
test message was sent by Codex. Resend remains available after verified sender
credentials are supplied. Changing the official email later updates the public
recipient through content/business.json unless a routing override is configured.

Second recipient added: abhishek.bhole123@gmail.com receives a configured CC of
each enquiry using FormSubmit's `_cc` field, or Resend's `cc` if the optional
server provider is configured later. The prepared Email this enquiry fallback
also includes this CC. Browser and native AJAX requests include the same
owner-controlled recipients; submitted fields cannot override them. The public
footer and schema still use kardaksamiksha4@gmail.com as the main email.

Owner activation steps: open the published /quote page and submit. Check
kardaksamiksha4@gmail.com (including Spam) for FormSubmit's
activation email and activate the form if required. Then submit once more and
verify receipt in both the main and CC inboxes. Actual delivery to either inbox
remains unverified by Codex.

Current values (production revision 1):
- recipient: kardaksamiksha4@gmail.com, from content/business.json; ENQUIRY_TO absent.
- cc: [abhishek.bhole123@gmail.com], normalized from content/enquiries.json by lib/site-config.ts.
- resendKey: unset; RESEND_API_KEY absent (no API key to expose).
- from: unset; ENQUIRY_FROM absent.
- formsubmitBrowser: true, set in app/api/enquiries/route.ts because the recipient
  matches the public email and complete Resend credentials are absent. The flag
  now means browser AJAX, not a browser navigation.

Status testing:
1. Submit from /quote with a unique TEST message. The URL stays on this site.
2. Watch Checking your details, Sending enquiry, then Sent — accepted for email
   delivery, or a failure with its code. A reference beginning SS- appears after
   validation and is included in the email subject and body.
3. Search both inboxes and Spam for that reference. This is the receipt check;
   the on-page success alone confirms only provider acceptance.
4. If ACTIVATION_REQUIRED appears, activate the primary inbox using FormSubmit's
   email, then submit again. If no activation email arrives, check Spam, retry
   once, and contact FormSubmit support if it still does not arrive.
5. For a failure check without sending, load the form and then set Network to
   Offline in browser developer tools. Submit: the details remain, success stays
   hidden, and Call +91 82916 89183, WhatsApp and Email this enquiry appear.
   Restore Online. The failure can be retried without re-entering the details.
6. Repeat a normal submission from the homepage quote dialog to verify its
   status and matching reference. Call uses tel:+918291689183; WhatsApp uses
   https://wa.me/918291689183.

Automated fixtures cover the configured CC and an empty CC list, both providers,
browser/native AJAX, malformed replies, missing acknowledgement, activation,
network failure, timeout, duplicate clicks, error preservation and successful
retry. These fixtures never contact the email provider or send real messages.

## Google Sheets register

The supplied workbook now has Enquiries (19 columns, a frozen header/reference,
filter and follow-up validation) and Connection setup. Sheet1 is preserved.
Website support and the Apps Script receiver are prepared in
integrations/google-sheets/. Live saving is inactive until the owner authorizes
and deploys Code.gs, then the /exec URL and SHIELD_WEBHOOK_TOKEN are stored as
GOOGLE_SHEETS_WEBHOOK_URL and GOOGLE_SHEETS_WEBHOOK_TOKEN runtime secrets.

The Google write occurs on the website server before email processing, so it
does not expose the token in browser requests or FormSubmit fields. It times out
after four seconds and failures do not stop email. New rows are validated website
enquiries, not confirmation that an email arrived. Apps Script authenticates the
request, checks headers, uses a lock and reference deduplication, and writes
literal text plus numeric dates. No real test lead, Google deployment or live
Sheets-to-website connection has been performed during preparation.
