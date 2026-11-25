# Premium motion integration — 25 November 2026

The owner's `vbk-motion-upgrade.zip` has been adapted to the existing VBK website. This extends the existing site and its seven-section homepage. Business facts, service destinations, contact details, form delivery, optional Sheets configuration, analytics, indexing and metadata remain in their existing systems.

| Tool | Locked version | Actual use |
| --- | --- | --- |
| GSAP | 3.15.1 | Coordinated headline/accent entrances, one-time section reveals, service/process staggering, and a process connector; ScrollTrigger controls entry and CustomEase uses the existing motion curves. |
| Motion | 14.14.0 | A velocity-aware spring moves the gallery's selected thumbnail indicator. The clickable targets remain stationary and semantic selection changes immediately. |
| Lenis | 1.3.27 | Smooth wheel scrolling on the desktop homepage, synchronized to ScrollTrigger through one GSAP ticker callback. Touch and keyboard keep native scrolling. |
| React Three Fiber | 9.8.2 | A decorative, extruded shield beside the final quote CTA. It uses the shield design from the uploaded kit, adapted to the approved palette. |
| Three.js | 0.187.0 | Low-complexity geometry, bevels, restrained materials and lighting for the shield. |

## Integration boundaries

`public/vbk-motion.mjs` is compiled to a separate hashed file under `public/motion-runtime/`. `public/premium-loader.mjs` imports it after the existing post-hydration interactions have initialized, on the homepage only. The extra engine is not in the initial shared interaction bundle or fetched for inner pages. Lenis CSS joins the existing combined stylesheet. The old homepage entrance observer is skipped to give each animated element one owner; inner-page motion and native illustration transitions remain.

The 3D island is part of the existing React client graph. `components/shield-islands.ts` imports `VBKShieldScene.tsx` only when the decoration becomes visible, the page is visible, motion is allowed and Data Saver is off. A WebGL2 capability probe releases its test context before the scene mounts. The existing server-rendered HTML now contains a shaded SVG shield that remains useful without JavaScript, WebGL or motion. This is a decorative brand image, not a certification claim.

The scene uses `frameloop="demand"`, capped pixel density and no external models, textures or environment maps. Its initial pose settles once, and pointer movement can gently tilt it; it does not float indefinitely. Rendering stops when settled. The island unmounts out of view or when the document is hidden, and its resources and listeners are cleaned up.

## Interaction safeguards

- Keyboard input completes active entrances, settles indicator springs and destroys Lenis so native keyboard scrolling is not locked.
- Pointer input can resume desktop smooth scrolling. Reduced motion, touch and hidden documents do not start its clock.
- Native dialogs release desktop smooth scrolling; nested dialog, textarea and select scrolling is excluded. The engine is removed while the body is fixed, so Lenis's `overflow:clip` cannot prevent the existing dialog from restoring the page position. Smooth scrolling resumes from that restored position.
- Hash links keep Lenis's anchor handling with a sticky-header offset. Normal navigation and contact/quote links remain native.
- Reveal content is never hidden in the server HTML while waiting for JavaScript. Active reveals can finish immediately for focus or pointer interaction.
- Gallery CSS remains a fallback when the optional spring module is unavailable. Resize and keyboard changes settle the indicator immediately.
- No live enquiry is submitted during testing.

## Verification and limits

The regression suite includes the previous SEO, routing, contact, provider and privacy checks, plus tests for the new scroll lifecycle, modal handling, keyboard/touch/reduced-motion conditions, spring ownership and WebGL fallback/probe cleanup. TypeScript checks the new client components. Run `node --test`, `pnpm check` and `pnpm build` for local validation.

Browser checks cover loaded GSAP/Motion engines, Lenis enable/disable, gallery selection, keyboard End navigation, opening and dismissing the quote dialog, seven homepage sections and no horizontal overflow. This browser explicitly disables WebGL, so it verifies the static shield fallback; the actual lit 3D scene still needs verification on a WebGL-capable device. No physical-phone, frame-rate, Lighthouse or Core Web Vitals result is claimed.

References: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [Motion values](https://motion.dev/docs/motion-value), [Lenis](https://github.com/darkroomengineering/lenis), [React Three Fiber on-demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
