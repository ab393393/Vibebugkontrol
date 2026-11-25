# Publishing original observations

The site currently has no first-party research dataset. Public source summaries
are editorial guidance, never relabelled as original VBK research.
Do not copy test fixtures, illustrative numbers or this blank template into the
live reports array as if they described real customers.

1. Start with real records the business is entitled to analyse. Keep the raw
   source outside this Git repository and public assets. Do not add tracking,
   enquiry-message reuse or customer-level research collection to the contact
   form. Arrange the relevant permissions and purpose before using records.
2. Define the observation unit and the period. Document inclusion/exclusion
   rules, how repeat jobs are handled, missing information, broad geography
   and whether the primary pest was reported or assessed. This first format
   counts one primary category per unit; it does not support efficacy claims.
3. Aggregate off-site. Use only Cockroaches, Bed bugs, Rodents, or Other /
   unconfirmed. Counts must equal the denominator. Publication floors are 20
   records overall and 5 per displayed group; combine suitable small groups
   into Other / unconfirmed or withhold the report. These floors do not establish
   significance or guarantee anonymity. Review the complete report for privacy.
4. Copy `docs/research-report.template.json` into a separate working document.
   Fill in actual method, sample, dates, limitations, reviewer and verification
   notes. Use a unique slug other than `standards`. Summary: 90–180 characters;
   title: at most 85. Dates use YYYY-MM-DD. Do not include private identifiers,
   contact details, precise addresses or customer free text. The limited-field
   validator is not a substitute for human source/privacy review.
5. After review and publication approval, set `publicationApproved` to true and
   append the completed aggregate object to `content/research-reports.json`.
   The registry creates its `/research/<id>` page, contextual links, metadata,
   Article schema, hub entry and sitemap entry. No routes or statistics are
   generated for draft templates. The page shows the denominator, counts,
   calculated percentages, dates, method, reviewer and limitations.
6. Run `npm test` and `npm run check`, then use the normal production build and
   private publishing workflow. Any public launch remains separate from adding
   a report. If the publication is corrected, increment `version`, advance
   `modifiedOn` and describe the change in `correctionNote`. Preserve a copy of
   the prior source evidence outside the public repository.

Dataset shape, totals, floor, date, approval and correction failures stop module
loading/building. The site never automatically sends research findings by email
or claims city-wide prevalence, a success rate or statistical significance.
