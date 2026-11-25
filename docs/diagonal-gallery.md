# Business gallery

The homepage business section uses an original diagonal gallery implementation with the site's three existing, labelled illustrations. It replaces the three business cards on the homepage. The main section count remains seven; commercial and services pages retain their card layouts.

The supplied React snippet contained a component invocation rather than the component's implementation. This site's homepage is rendered from HTML templates, so the equivalent presentation is rendered by `diagonalGalleryHtml` in `lib/diagonal-gallery.mjs`, then enhanced by `public/diagonal-gallery.mjs`. No vendor source or additional animation package is used.

`businessGalleryHtml` in `lib/render-template.mjs` supplies the following options:

| Option | Current value | Meaning |
| --- | --- | --- |
| `step` | `110` | Desktop scroll distance in pixels per selection |
| `duration` | `0.9` | Illustration transition duration in seconds |
| `thumb` | `22` | Adjacent illustration scale, as a percentage |
| `photos` | Three business illustrations | Image sources, alternative text, headings, descriptions, tags and service links |

Illustrations and short summaries come from `lib/service-visuals.mjs`; paths and service labels come from `lib/commercial-services.mjs`. Keep descriptions truthful and illustration labels visible. Change these records to update the gallery and the existing service cards together.

The gallery responds to ordinary scrolling on a desktop with a fine pointer. It never captures wheel events, pins the page or adds scroll spacers. An explicit choice takes precedence until the gallery leaves view. Phones and reduced-motion users use the selection buttons. Left/Right and Home/End work within the controls. Keyboard interaction has no transition. Inactive slides are inert and hidden from assistive technology, while all three service destinations remain available below the gallery. Manual changes have a polite status announcement; scroll changes are quiet.

Without JavaScript, all three illustrations, summaries and links remain readable as ordinary cards. Styles are included in the existing combined stylesheet. Images keep their WebP sources, responsive variants, dimensions and lazy loading. No enquiry, email, Sheets or analytics settings are changed.
