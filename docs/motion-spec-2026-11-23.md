# VBK motion pass — 23 November 2026

Keep the approved forest-green, ivory and lime design. Motion should make the website feel calm, responsive and easy to scan. No animation library was added.

## Applied guidance

| Requested skill | Application |
| --- | --- |
| Animate | Implement the selected transitions with CSS and the Web Animations API; use a shared curve and short interface timings. |
| Animation Vocabulary | Name the effects consistently in the specification below. |
| Apple Design | Immediate press feedback, trigger-anchored panels, reversals from the current presentation, stable controls during navigation, reduced-transparency and contrast preferences. |
| Find Animation Opportunities | Apply the frequency, purpose, speed and function gates; reject distracting motion. |
| UI/UX Pro Max | Verify reduced-motion guidance, restrained choreography, touch gating and a readable final state. The local UX search returned Reduced Motion, Excessive Motion and Motion Sensitivity. |
| Skill Creator | Check the scope and availability of the existing named skills. This is a website change, so creating or modifying a personal skill is unnecessary. |
| Web Design Guidelines | Review the changed UI against the current published guidelines, including focus, semantic controls, interruption, explicit transition properties and hydration safety. |

## Opportunities and decisions

| Location | Before | After | Purpose | Frequency | Why / exact motion |
| --- | --- | --- | --- | --- | --- |
| `public/motion.mjs` | A 1,200 ms hero fade, with a delayed start | A visible heading and image settle into place | Delight | First visit | Heading: translate 12 px to 0 over 600 ms. Art: translate 18 px / scale .985 to its final state over 700 ms, delayed 50 ms. No opacity gate on the headline or primary image. |
| `public/motion.mjs` | New commercial illustrations and infographic cards were outside the reveal system | One-time coordinated card entrances | Preventing a jarring change | Occasional marketing view | Opacity .12 to 1, translate 16 px to 0, 550 ms, 50 ms stagger capped at 100 ms. Focus and pointer interaction finish the decorative entrance immediately. |
| `public/motion.mjs`, `public/app.js` | Rapid panel reversals restarted from a prescribed endpoint | Reversals start from the current visible opacity and transform | Spatial consistency | Occasional | 200 ms entrance, 150 ms exit, scale .97 to 1. Menus originate above; quick contact originates at bottom right. Stale completion callbacks cannot hide a reopened panel. |
| `public/refinements.css` | Details opened instantly | Native accordion / collapse with a short size transition | State indication | Occasional | 200 ms block-size and opacity transition, scoped to native details. This is the deliberate layout-property exception; CSS capability checks preserve the normal native fallback. |
| `public/app.js`, `public/refinements.css` | Separate tab and content timings | A 250 ms indicator with a 240 ms content entrance | State indication | Occasional | A 50 ms stagger separates image and copy. Keyboard selection and focus remain immediate. |
| `public/refinements.css` | Independent image/card hover timing | Coordinated miniature depth and short arrow feedback | Feedback | Repeated | Card lift: 4 px / 250 ms. Illustration: 3 px and scale 1.025 / 500 ms. Arrow: 3 px / 160 ms. Hover is restricted to fine pointers. |
| `public/refinements.css` | A hard page replacement | Browser-native page crossfade, with separate stable header/contact surfaces | Preventing a jarring change | Occasional | Old page fades over 150 ms; new page fades and translates 6 px over 200 ms. No link interception or artificial navigation delay. Keyboard navigation skips the transition. |

The shared entrance curve is `cubic-bezier(0.23, 1, 0.32, 1)`, exposed as `--ease-out` and `MOTION_EASE`; `--ease-ui` refers to the same CSS token. Existing press feedback remains 100 ms. Functional form data does not move for decoration.

## Deliberately rejected

- Continuous hero parallax: unnecessary per-scroll work and motion sensitivity. The primary image now has a contained, pointer-only zoom.
- Cursor trails and magnetic buttons: move the target while someone is trying to contact the business; fail the function gate.
- Typewriter headlines and animated contact numbers: delay reading and interfere with a quick call or quote; fail the function gate.
- Keyboard search/menu flourishes: keyboard actions should be immediate; fail the frequency/input gate.
- Automatic infographic loops: distract from the labels; a one-time entrance communicates the grouping adequately.

## Vocabulary

- **Stagger** — Animate several items one after another with a small delay between each, creating a cascade.
- **Orchestration** — Deliberately timing multiple animations so they feel like one coordinated motion.
- **Crossfade** — One element fades out as another fades in, in the same spot.
- **Accordion / Collapse** — A section smoothly expands and collapses its height to show or hide content.
- **Interruptible animation** — An animation that can be smoothly redirected mid-flight instead of finishing first.

## Rendering and accessibility

`components/SiteInteractions.tsx` signals React's committed state. The existing deferred static module starts once that signal and the module are both ready, in either order. Animation setup therefore cannot race React's initial rendering. Native links, the quote page and server-rendered content remain available before enhancement.

The reveal observer keeps its bookkeeping in JavaScript collections rather than changing attributes on React-owned content. Nothing is hidden in the server HTML while waiting for an observer. Hash navigation and back/forward restoration skip the first-visit choreography. Reduced-motion and keyboard input stop active tracked motion. Reduced-transparency removes backdrop blur; increased contrast makes floating surfaces solid and reinforces their borders.

The published Web Interface Guidelines prefer transform/opacity. The sole intentional exception is native accordion block-size, kept to 200 ms and behind capability checks. All links, business facts, page copy, metadata, image sources, analytics settings and enquiry delivery rules retain their existing behavior.

## Verification

- 51 automated checks pass, including rapid panel reversal, stale completion, keyboard/reduced-motion panel behavior, enquiry delivery mocks, metadata, links and images.
- TypeScript passes.
- Browser checks: pointer menu reversals, Escape dismissal and focus return, quote dialog open/close without submitting, pointer tab selection and keyboard arrow selection, native guide expansion, readable AMC content, normal same-origin navigation and no horizontal overflow at the checked desktop viewport.
- The post-commit setup resolves the new pre-hydration animation-marker warning. The corrected preview showed no new hydration warning during the subsequent panel and disclosure checks.
- Physical phone, Safari, reduced-transparency and high-contrast visual checks remain device checks. No 60/120 FPS or Core Web Vitals measurement is claimed.

Implementation references: [native details content](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content), [same-origin view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document), [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
