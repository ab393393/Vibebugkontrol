export const MOTION_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const MOTION_EASE_SETTLE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const transientAnimations = new Set();
const panelAnimations = new WeakMap();
let inputReady = false;

export const motionAllowed = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.inputModality !== 'keyboard';

export function trackMotion(animation) {
  transientAnimations.add(animation);
  animation.finished.then(() => transientAnimations.delete(animation), () => transientAnimations.delete(animation));
  return animation;
}

function finishMotion() {
  for (const animation of transientAnimations) {
    try { animation.finish(); } catch { animation.cancel(); }
  }
}

export function initMotionInput() {
  if (inputReady) return;
  inputReady = true;
  document.addEventListener('keydown', () => {
    document.documentElement.dataset.inputModality = 'keyboard';
    finishMotion();
  }, true);
  document.addEventListener('pointerdown', () => {
    document.documentElement.dataset.inputModality = 'pointer';
  }, true);
}

// Keep the current visual state when a pointer rapidly reverses a panel.
// Visibility and keyboard access follow the requested state immediately.
export function revealPanel(element, visible) {
  if (element.dataset.visible === String(visible)) return;
  const previous = panelAnimations.get(element);
  const interrupted = previous && !element.hidden ? getComputedStyle(element) : null;
  const from = interrupted ? {opacity: interrupted.opacity, transform: interrupted.transform} : null;
  previous?.cancel();
  panelAnimations.delete(element);
  element.dataset.visible = String(visible);
  element.inert = !visible;
  if (!motionAllowed() || !element.animate || (!visible && element.hidden)) {
    element.hidden = !visible;
    return;
  }
  element.hidden = false;
  const offset = element.classList.contains('contact-popover') ? '6px' : '-4px';
  const collapsed = {opacity: 0, transform: `translateY(${offset}) scale(.97)`};
  const expanded = {opacity: 1, transform: 'translateY(0) scale(1)'};
  const animation = trackMotion(element.animate(
    [from || (visible ? collapsed : expanded), visible ? expanded : collapsed],
    {duration: visible ? 200 : 150, easing: MOTION_EASE, fill: 'both'}
  ));
  panelAnimations.set(element, animation);
  animation.finished.then(() => {
    if (panelAnimations.get(element) !== animation) return;
    element.hidden = !visible;
    panelAnimations.delete(element);
    animation.cancel();
  }, () => {});
}

export function initPageMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Native navigation stays native: no intercepted links, timers or form hooks.
  window.addEventListener('pageswap', event => {
    if (event.viewTransition && !motionAllowed()) event.viewTransition.skipTransition();
  });
  window.addEventListener('pagereveal', event => {
    if (event.viewTransition && !motionAllowed()) event.viewTransition.skipTransition();
  });

  let observer;
  preference.addEventListener('change', event => {
    if (event.matches) { observer?.disconnect(); finishMotion(); }
  });
  if (!motionAllowed()) return;
  // The uploaded GSAP engine owns the homepage choreography. Inner pages
  // keep their existing lightweight animation and native view transitions.
  if (document.querySelector('[data-vbk-motion]')) return;

  // Each line keeps its server-rendered layout and readable first paint.
  // Only the first visit gets this short, coordinated introduction.
  const restoring = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
  if (!window.location.hash && !restoring) {
    const title = document.querySelector('main h1');
    const lines = [...document.querySelectorAll('.hero-line > *')];
    const art = document.querySelector('.hero-visual, .service-illustration, .page-hero-image');
    if (lines.length) lines.forEach((line,index) => trackMotion(line.animate(
      [{opacity:.65,transform:'translateY(28%)'},{opacity:1,transform:'translateY(0)'}],
      {duration:700,delay:index*65,easing:MOTION_EASE_SETTLE,fill:'backwards'}
    )));
    else if (title?.animate) trackMotion(title.animate(
      [{transform: 'translateY(12px)'}, {transform: 'translateY(0)'}],
      {duration: 600, easing: MOTION_EASE}
    ));
    if (art?.animate && !art.classList.contains('service-illustration')) trackMotion(art.animate(
      [{transform: 'translateY(24px)'}, {transform: 'translateY(0)'}],
      {duration:850,delay:65,easing:MOTION_EASE_SETTLE,fill:'backwards'}
    ));
    const image = document.querySelector('.hero-image');
    if (image?.animate) trackMotion(image.animate(
      [{transform:'scale(1.08)'},{transform:'scale(1.02)'}],
      {duration:1000,easing:MOTION_EASE_SETTLE}
    ));
    const frame = document.querySelector('.hero-image-wrap');
    if (frame?.animate) trackMotion(frame.animate(
      [{clipPath:'inset(0 0 9% 0)'},{clipPath:'inset(0 0 0 0)'}],
      {duration:850,easing:MOTION_EASE_SETTLE}
    ));
  }

  if (!('IntersectionObserver' in window)) return;
  const entranceAnimations = new WeakMap();
  const selectors = '.section-heading, .pest-card, .business-intro, .commercial-visual-card, .guide-card, .process-step, .closing-content, .closing-art, .faq-intro, .home-coverage, .pest-explainer, .glance-grid > li, .amc-visual-grid > li, .related-pages > h2';
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      if (!motionAllowed() || element.contains(document.activeElement) || window.location.hash) continue;
      const siblings = [...element.parentElement.children].filter(item => item.matches(selectors));
      const delay = Math.min(3, Math.max(0, siblings.indexOf(element))) * 65;
      const rest = getComputedStyle(element).transform;
      const settled = rest === 'none' ? 'translateY(0)' : rest;
      const animation = trackMotion(element.animate(
        [{opacity:.6,transform:`translateY(20px) ${rest === 'none' ? '' : rest}`},{opacity:1,transform:settled}],
        {duration:650,delay,easing:MOTION_EASE_SETTLE,fill:'backwards'}
      ));
      entranceAnimations.set(element, animation);
    }
  }, {threshold: .08, rootMargin: '0px 0px -12px 0px'});
  document.querySelectorAll(selectors).forEach(element => observer.observe(element));
  // A hover or a focus always takes precedence over a decorative entrance.
  function settleTarget(event) {
    const element = event.target.closest?.(selectors);
    if (!element) return;
    observer.unobserve(element);
    const animation = entranceAnimations.get(element);
    if (animation) { try { animation.finish(); } catch { animation.cancel(); } }
  }
  document.addEventListener('focusin', settleTarget);
  document.addEventListener('pointerover', settleTarget, {passive: true});
}
