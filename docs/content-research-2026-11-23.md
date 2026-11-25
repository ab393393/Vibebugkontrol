# VBK content research — 23 November 2026

This pass uses authenticated Semrush Analytics through the Supermetrics connector, direct competitor pages and the existing VBK service catalogue. It preserves the website design and the confirmed scope: pest control in Mumbai for homes and businesses, cockroaches, bed bugs, rodents, identification enquiries and business AMCs.

## Measured competitor sample

Database: India (`in`). Volumes are Semrush estimates of average monthly searches in the country database, not city-only audience counts or expected VBK visits. Positions are those returned in the Semrush report, not a live Google ranking check. Retrieval date is the date above; the connector did not supply the underlying snapshot date. The reports returned ten rows for non-empty results even when more were requested, so this is a sample rather than an exhaustive keyword gap analysis.

| Competitor / report | Keyword | Returned position | Estimated monthly searches |
| --- | --- | ---: | ---: |
| Rentokil PCI Mumbai URL | pest control mumbai | 1 | 4,400 |
| Rentokil PCI Mumbai URL | pest control services in mumbai | 1 | 210 |
| Rentokil PCI domain | cockroach control | 1 | 4,400 |
| Rentokil PCI domain | bed bug exterminator | 2 | 9,900 |
| Pest Control 99 domain | pest control andheri west | 11 | 390 |
| Pest Control 99 domain | pest control andheri east | 19 | 260 |

These rows establish a useful content direction, not an easy-ranking claim. The broad cockroach and bed bug terms cover India and are not evidence of equivalent demand for a Mumbai-specific phrase. No keyword difficulty score was returned.

Infinite Pest Control's domain report and VBK's exact homepage URL report returned no rows. This does not establish zero traffic, no Google indexing or absence of rankings. The first VBK domain-level report returned unrelated `chatgpt.site` hosts; it was excluded because its scope was not specific to VBK. Use a verified Search Console property for a first-party baseline.

Keyword-overview requests (`phrase_this`) and later service-URL queries failed with a provider `QUERY_ERROR`. Only successful report values above and in the companion JSON are used. No missing volumes or difficulty values have been filled in.

Raw successful reports, query targets and exclusions: [semrush-2026-11-23.json](research/semrush-2026-11-23.json).

## Public-page observations and application

| Competitor | Public content observed | Application to VBK |
| --- | --- | --- |
| Pest Control 99 | Service-specific symptom descriptions, a visit process, local pages and prominent enquiry links. Its warranties and product claims are its own. | Use clear service names, practical preparation questions and contextual links. Add neighbourhood pages only after VBK confirms coverage and provides distinct local information. |
| Rentokil PCI | Separate Mumbai, residential and commercial content; an inspection-to-aftercare explanation; a cost FAQ and industry guidance. | Clarify VBK's quote steps and service scope. Strengthen restaurant AMC information and connect it to the homepage and service pages. |
| Infinite Pest Control | Direct phone/WhatsApp booking and a short service process. The homepage also contains placeholder testimonial text. | Retain direct contact routes and a short next-step explanation. Publish only genuine, owner-approved reviews and business evidence. |

The competitor sites are research references, not evidence of VBK's credentials or operating methods. Their wording, guarantees, prices, product claims and testimonials have not been reused.

## Page and intent map

| Priority | Visitor intent | Existing VBK destination | Implemented change |
| --- | --- | --- | --- |
| 1 | Pest control in Mumbai | `/` and `/services` | More concrete homepage introduction, service cards and links; retain the Mumbai H1 and title. |
| 1 | Cockroach control | `/services/cockroach-control` | Specific introduction and metadata; practical cupboard-preparation FAQ. |
| 1 | Bed bug treatment | `/services/bed-bug-control` | Explain observations and affected furnishings; quote-preparation FAQ. |
| 1 | Rodent control | `/services/rodent-control` | Explain signs, site access and scope; restaurant/AMC monitoring questions. |
| 1 | Restaurant or business AMC | `/commercial/amc` | Direct homepage link, clearer contract definition and restaurant-specific planning section. |
| 2 | Residential or commercial service | `/residential`, `/commercial` | Mumbai-specific page titles, descriptions and headings. |
| 2 | Cost, preparation and safety questions | `/faq`, `/guides/cost-safety-duration`, existing preparation guides | Sharper FAQs and guide labels; descriptive internal links. |
| Pending owner data | Neighbourhood-specific pest control | Existing unpublished area records | No new coverage claim or area page published. |

Priority is an editorial judgement based on VBK's confirmed services and the returned competitor sample. It is not a numeric keyword-difficulty or revenue forecast. Service-specific Mumbai keyword volumes and AMC volumes remain unverified.

## Evidence needed for a stronger next pass

- Approved treatment methods, products, preparation and follow-up terms for each offered service.
- Confirmed neighbourhood coverage, a business address and official email/domain when ready.
- Licence/certification evidence, genuine reviews and permission to show customer or client names.
- Approved prices or pricing examples; do not infer prices from competitors.
- Search Console query/click/impression data for the exact published property, plus a later successful Semrush keyword-overview export if available.

## References

- https://www.pestcontrol99.com/services/cockroach-pest-control/
- https://www.rentokil-pestcontrolindia.com/about-rentokil/local-branches/mumbai
- https://www.rentokil-pestcontrolindia.com/services/commercial-pest-control/food-processing/food-safety-gmps
- https://infinitepestcontrol.in/
- https://infinitepestcontrol.in/services.html
- https://www.semrush.com/kb/683-what-is-search-volume-in-semrush
- https://www.epa.gov/safepestcontrol/integrated-pest-management-ipm-principles
- https://www.epa.gov/bedbugs/how-find-bed-bugs
- https://www.epa.gov/rodenticides/identify-and-prevent-rodent-infestations

General educational references support pest descriptions; they do not certify VBK, prove Mumbai prevalence or establish specific treatment availability.
