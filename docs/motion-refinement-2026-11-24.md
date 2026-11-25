# Motion refinement — 24 November 2026

The approved green, ivory and lime design, wording and seven homepage sections remain. No animation package, account connection or subscription was added. The existing CSS and Web Animations API implement the changes.

| Area | Refinement | Timing and purpose |
| --- | --- | --- |
| Homepage headline | Each of the three lines settles through its own small mask. The server still returns one complete H1. | 700 ms, 65 ms stagger; first-visit introduction. Text starts partially visible, and the server HTML is never hidden pending JavaScript. |
| Hero illustration | A contained 9% frame reveal, 24 px settle and gentle zoom share one curve. | 850–1000 ms; first-visit composition. Hover zoom is restrained to 1.045. |
| Section entrances | A lighter opacity change, consistent travel, and short stagger group headings and cards. | 650 ms, 65 ms stagger capped at 195 ms. One-time only; focus and pointer interaction settle entrances immediately. Original transforms are retained, including responsive artwork scaling. |
| Business gallery | Illustrations use a smoother deceleration; captions move in the direction of selection, with a masked title and short copy sequence. | Image 900 ms, title 450 ms, supporting copy 300 ms. CSS transitions retarget from their current presentation when interrupted. No input lock or autoplay timer. |
| Gallery controls | The selected thumbnail has a sliding indicator; the current number rolls inside a fixed window. | Indicator 360 ms; counter 400 ms. These are decorative selection feedback, with an immediate semantic selected state and live announcement for manual changes. |
| Images during navigation | Gallery illustrations and their matching service-page heroes share unique native view-transition names. Header and contact controls retain their existing stable surfaces. | 650 ms image continuity in supporting browsers. Normal links remain the fallback; page crossfade is 260 ms. |
| Calls to action | Directional arrow feedback and reversible link underlines. | 200–240 ms, pointer hover only. Call, WhatsApp, quote and form destinations are preserved. |

The settle curve is `cubic-bezier(0.32, 0.72, 0, 1)`, exposed as the existing curve family's `--ease-drawer` and `MOTION_EASE_SETTLE`. Short feedback continues to use `--ease-out` / `MOTION_EASE`. A shared `--ease-in-out` token is available for on-screen morphs.

Gallery scroll handlers now skip unchanged selection state. Images are decoded when the gallery approaches the viewport, retaining lazy-loading markup on the server. The indicator is measured only on selection or resize; geometry reads precede writes. Neither image size nor counter layout animates. No scroll capture, pinning, artificial navigation wait, pointer-following CTA, endless loop or animated form data was introduced.

Keyboard input settles tracked motion and disables gallery transitions, including transition delays. Reduced motion suppresses spatial choreography and native page transitions. Existing transparency and contrast preferences are retained. The linked service content and static gallery fallback remain readable without JavaScript.

Verification includes TypeScript, the full automated suite, desktop browser checks of readable hero lines, rapid gallery changes, counter and indicator alignment, keyboard End selection, inert inactive slides, selected service navigation and matching native image identities. Browser checks are functional and visual; they are not a frame-rate, Core Web Vitals or physical-phone measurement. Safari and physical-device motion checks remain unverified.

Review reference: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
