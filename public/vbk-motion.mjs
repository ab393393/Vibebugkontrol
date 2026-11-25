// Adapted from the owner's vbk-motion-upgrade.zip for the existing SSR site.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { animate, motionValue } from 'motion';
import { motionAllowed, MOTION_EASE, MOTION_EASE_SETTLE } from './motion.mjs';

const mounted = new WeakMap();

export function mountVBKMotion(root = document) {
  if (mounted.has(root)) return mounted.get(root);
  const page = root.querySelector('[data-vbk-motion]');
  if (!page) return () => {};
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('vbk-out', MOTION_EASE.replace(/^cubic-bezier\(|\)$/g, ''));
  CustomEase.create('vbk-settle', MOTION_EASE_SETTLE.replace(/^cubic-bezier\(|\)$/g, ''));
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const desktop = window.matchMedia('(min-width:1001px) and (hover:hover) and (pointer:fine)');
  const mm = gsap.matchMedia();
  const disposers = [];
  const active = new Set();
  const springs = new Map();
  const played = new WeakSet();
  let lenis, removeScrollUpdate, disposed = false;
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    disposers.push(() => target.removeEventListener(event, handler, options));
  };
  const tween = (targets, from, to) => {
    let animation;
    animation = gsap.fromTo(targets, from, {
      duration:.65, ease:'vbk-settle', overwrite:'auto', clearProps:'transform,opacity',
      ...to, onComplete:() => active.delete(animation), onInterrupt:() => active.delete(animation)
    });
    active.add(animation);
    return animation;
  };
  const finish = () => {
    for (const animation of [...active]) { animation.progress(1); animation.kill(); }
    active.clear();
    for (const item of springs.values()) item.value.jump(item.target);
  };

  // Spring feedback owns only the decorative indicator, never a click target.
  page.querySelectorAll('[data-diagonal-gallery]').forEach(gallery => {
    const pill = gallery.querySelector('[data-gallery-pill]');
    if (!pill) return;
    const transform = getComputedStyle(pill).transform;
    const x = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
    const value = motionValue(x);
    const item = {value, target:x};
    const stopRender = value.on('change', next => { pill.style.transform = `translateX(${next}px)`; });
    springs.set(gallery, item);
    gallery.dataset.springIndicator = 'true';
    listen(gallery, 'vbk:gallery-indicator', event => {
      event.preventDefault();
      item.target = event.detail.left;
      if (event.detail.immediate || !motionAllowed()) value.jump(item.target);
      else animate(value, item.target, {type:'spring', duration:.5, bounce:.2});
    });
    disposers.push(() => { value.jump(item.target); stopRender(); value.destroy(); delete gallery.dataset.springIndicator; });
  });

  mm.add('(prefers-reduced-motion:no-preference)', () => {
    const triggers = [];
    const restoring = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    if (motionAllowed() && !window.location.hash && !restoring) {
      const lines = [...page.querySelectorAll('.hero-line>*')];
      if (lines.length) tween(lines, {yPercent:24, opacity:.7}, {yPercent:0, opacity:1, duration:.7, stagger:.065});
      const accents = [...page.querySelectorAll('[data-vbk-hero-reveal]')];
      if (accents.length) tween(accents, {y:12, opacity:.8}, {y:0, opacity:1, duration:.6, stagger:.065});
    }
    const reveal = (trigger, targets, stagger = 0) => {
      const animation = ScrollTrigger.create({
        trigger, start:'top 92%', once:true,
        onEnter:() => {
          if (played.has(trigger)) return;
          played.add(trigger);
          if (!motionAllowed() || window.location.hash || trigger.getBoundingClientRect().bottom <= 0) return;
          tween(targets, {y:22, opacity:.6}, {y:0, opacity:1, stagger});
        }
      });
      triggers.push(animation);
    };
    page.querySelectorAll('[data-vbk-reveal]').forEach(element => reveal(element, element));
    page.querySelectorAll('[data-vbk-stagger]').forEach(element => reveal(element, [...element.children].filter(child => !child.hasAttribute('aria-hidden')), .065));
    const line = page.querySelector('[data-vbk-process-line]');
    if (line) triggers.push(ScrollTrigger.create({trigger:line.parentElement, start:'top 88%', once:true, onEnter:() => {
      if (!motionAllowed()) return;
      tween(line, {scaleX:0}, {scaleX:1, duration:.9});
    }}));
    return () => { finish(); triggers.forEach(trigger => trigger.kill()); };
  });

  // One desktop scroll clock. Touch, keyboard and reduced-motion use native
  // scrolling. Native dialogs and nested scrolling never feed this clock.
  const tick = time => lenis?.raf(time * 1000);
  function destroyLenis() {
    if (!lenis) return;
    gsap.ticker.remove(tick);
    removeScrollUpdate?.();
    lenis.destroy(); lenis = undefined;
    delete page.dataset.lenisActive;
  }
  function syncLenis() {
    // Native dialog scroll-lock owns the page while open. Destroying Lenis
    // removes its overflow:clip before the existing modal restores scrollY.
    if (disposed || !desktop.matches || reduced.matches || !motionAllowed() || document.hidden || document.querySelector('dialog[open]') || document.body.style.position === 'fixed') { destroyLenis(); return; }
    if (!lenis) {
      const offset = -(document.querySelector('.site-header')?.getBoundingClientRect().height || 100) - 12;
      lenis = new Lenis({autoRaf:false, smoothWheel:true, syncTouch:false, lerp:.12, anchors:{offset},
        prevent:node => !!node.closest('dialog,[data-lenis-prevent],textarea,select'),
        virtualScroll:({event}) => !event.ctrlKey && !event.metaKey && !document.querySelector('dialog[open]')
      });
      removeScrollUpdate = lenis.on('scroll', () => ScrollTrigger.update());
      gsap.ticker.add(tick);
      page.dataset.lenisActive = 'true';
    }
  }
  const modalObserver = new MutationObserver(syncLenis);
  root.querySelectorAll('dialog').forEach(dialog => modalObserver.observe(dialog, {attributes:true,attributeFilter:['open']}));
  modalObserver.observe(document.body, {attributes:true,attributeFilter:['style']});
  listen(document, 'keydown', () => { finish(); destroyLenis(); }, true);
  listen(document, 'pointerdown', syncLenis, true);
  listen(document, 'visibilitychange', () => { if (document.hidden) finish(); syncLenis(); });
  listen(desktop, 'change', syncLenis);
  listen(reduced, 'change', () => { finish(); syncLenis(); });
  listen(document, 'focusin', event => {
    for (const animation of [...active]) if (animation.targets().some(element => element.contains?.(event.target))) animation.progress(1);
  });
  listen(document, 'pointerover', event => {
    for (const animation of [...active]) if (animation.targets().some(element => element.contains?.(event.target))) animation.progress(1);
  }, {passive:true});
  listen(window, 'pagehide', () => { finish(); destroyLenis(); });
  listen(window, 'pageshow', event => { if (event.persisted) { syncLenis(); ScrollTrigger.refresh(); } });
  syncLenis();
  page.dataset.vbkEngines = 'gsap motion';
  const cleanup = () => {
    if (disposed) return;
    disposed = true; finish(); destroyLenis(); mm.revert(); modalObserver.disconnect();
    disposers.forEach(dispose => dispose()); springs.clear();
    delete page.dataset.vbkEngines; mounted.delete(root);
  };
  mounted.set(root, cleanup);
  return cleanup;
}
