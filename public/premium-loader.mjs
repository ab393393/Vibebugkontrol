// Keep the premium engine off the initial and inner-page JavaScript path.
export async function loadPremiumMotion() {
  if (!document.querySelector('[data-vbk-motion]')) return;
  const path = document.querySelector('meta[name="vbk-motion-module"]')?.content;
  if (!path || !path.startsWith('/motion-runtime/')) return;
  try {
    const {mountVBKMotion} = await import(path);
    mountVBKMotion(document);
  } catch (error) {
    // All content, links and controls remain native when enhancement fails.
    console.warn('VBK motion enhancement unavailable; static presentation retained.', error);
  }
}
