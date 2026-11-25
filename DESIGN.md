# VBK design direction

Keep the existing forest-green, warm ivory and lime brand, self-hosted Shine Sans and italic Shine Serif, architecture illustrations and spacious editorial homepage. This is the owner's established design. New components use the same system across all 22 server-rendered pages.

The main visitor task is to choose residential or commercial pest care, understand an appropriate next step, and send an enquiry. Prefer clear service routes, visible form labels, honest requested timing and useful recovery states. Do not add invented prices, reviews, certifications, service locations, telephone numbers or guarantees.

Use the feature-accordion pattern on the service index and a restrained, numbered FAQ treatment. These are custom adaptations of the public 21st.dev Ruixen Feature Accordion Section and Origin UI Accordion references; their account-gated source code is not imported. No 21st API key or membership has been configured.

Use the existing shadcn Button component with the `shield`, `shieldOutline`, and `shieldLime` variants. Component appearance belongs in those variants and shared CSS, not arbitrary colour overrides on each usage. Keep semantic links for navigation and buttons for actions. Native disclosures keep content available before JavaScript runs.

Motion: pointer interactions generally use 120–240 ms, a strong ease-out curve, and transform/opacity. Keyboard actions are immediate. Keep reduced-motion support, interruptible panels, instant focus outlines, 44 px or larger touch targets, 16 px mobile inputs and safe-area spacing. Gate hover effects by input capability. Avoid continuous decorative movement and layout-property animation.

CSS changes for this refinement live in `public/refinements.css`; existing brand tokens remain in `public/styles.css`. Preserve original page hierarchy, enquiry fields, routes, data attributes and email/analytics safeguards. Do not apply an unrelated skill's palette or scaffold over this system.

Installed design guidance: UI/UX Pro Max, Hallmark, Emil Kowalski's design/motion bundle, shadcn and Vercel Web Interface Guidelines. Apply web-relevant guidance to this project; native Swift/Expo and migration instructions are available only when their task applies. Browser and real-phone verification are pending; code checks do not certify a visual audit.


Knowledge pages retain the same editorial hierarchy, colours and self-hosted
fonts. Use numbered pest sections, descriptive reading links and concise
source lists; group guides by reader purpose. Keep source citations and scope
visible, table captions/headers accessible, and reports separate from general
guidance. New knowledge sections add no animation runtime or image payload.
