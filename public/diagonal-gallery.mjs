import { gallerySettings, galleryIndex, galleryPose, scrollGalleryIndex } from '../lib/diagonal-gallery.mjs';
import { motionAllowed } from './motion.mjs';

const galleries = new WeakMap();

export function initDiagonalGallery(root) {
  if (galleries.has(root)) return galleries.get(root);
  const slides = [...root.querySelectorAll('[data-gallery-slide]')];
  if (slides.length < 2) return () => {};
  const settings = gallerySettings(root.dataset);
  const choices = [...root.querySelectorAll('[data-gallery-select]')];
  const previous = root.querySelector('[data-gallery-previous]');
  const next = root.querySelector('[data-gallery-next]');
  const controls = root.querySelector('[data-gallery-controls]');
  const count = root.querySelector('[data-gallery-count]');
  const pill = root.querySelector('[data-gallery-pill]');
  const images = slides.map(slide => slide.querySelector('.dg-image'));
  const headings = slides.map(slide => slide.querySelector('h3').textContent);
  const stage = root.querySelector('.dg-image-well');
  const status = root.querySelector('[data-gallery-status]');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:761px)');
  const preference = window.matchMedia('(prefers-reduced-motion:reduce)');
  const disposers = [];
  let active = 0, visible = false, manual = false, frame = 0, readyFrame = 0, resizeFrame = 0, alive = true;
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    disposers.push(() => target.removeEventListener(event, handler, options));
  };
  root.style.setProperty('--dg-duration', `${settings.duration}s`);
  root.dataset.galleryEnhanced = 'true';
  root.setAttribute('aria-roledescription', 'carousel');
  controls.hidden = false;
  function placeIndicator(left, immediate = false) {
    const event = new CustomEvent('vbk:gallery-indicator', {cancelable:true, detail:{left,immediate:immediate || !motionAllowed()}});
    if (root.dispatchEvent(event)) pill.style.transform = `translateX(${left}px)`;
  }

  function select(index, source = 'manual') {
    const target = galleryIndex(index, slides.length);
    if (source === 'manual') manual = true;
    const changed = target !== active;
    if (!changed && source !== 'initial') return;
    // Read before writing. The indicator moves as a whole; its width never
    // interpolates, and repeated scroll events do not rewrite unchanged state.
    const indicator = {left:choices[target].offsetLeft,width:choices[target].offsetWidth};
    root.dataset.galleryDirection = target < active ? 'previous' : 'next';
    active = target;
    slides.forEach((slide, index) => {
      const selected = index === active;
      const pose = galleryPose(index, active, settings.thumb);
      const image = images[index];
      image.style.transform = `translate(${pose.translate}%, ${pose.translate}%) scale(${pose.scale})`;
      image.style.opacity = String(pose.opacity);
      slide.style.zIndex = String(pose.layer);
      slide.dataset.active = String(selected);
      slide.inert = !selected;
      if (selected) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    choices.forEach((choice, index) => choice.setAttribute('aria-pressed', String(index === active)));
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
    count.style.transform = `translateY(-${active * 100 / slides.length}%)`;
    pill.style.width = `${indicator.width}px`;
    placeIndicator(indicator.left, source === 'initial');
    // Scroll-driven decoration stays quiet; explicit choices are announced.
    if (changed && source === 'manual') status.textContent = `${active + 1} of ${slides.length}: ${headings[active]}`;
  }
  function updateFromScroll() {
    frame = 0;
    if (!alive || !visible || manual || !finePointer.matches || !motionAllowed()) return;
    const bounds = stage.getBoundingClientRect();
    select(scrollGalleryIndex(bounds.top + bounds.height / 2, window.innerHeight, settings.step, slides.length), 'scroll');
  }
  function queueScroll() {
    if (alive && !frame && visible && !manual && finePointer.matches && motionAllowed()) frame = window.requestAnimationFrame(updateFromScroll);
  }

  select(0, 'initial');
  readyFrame = window.requestAnimationFrame(() => { if (alive) root.dataset.galleryReady = 'true'; });
  choices.forEach(choice => listen(choice, 'click', () => select(Number(choice.dataset.gallerySelect))));
  listen(previous, 'click', () => select(active - 1));
  listen(next, 'click', () => select(active + 1));
  listen(root, 'focusin', () => { manual = true; });
  listen(controls, 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1);
    select(target);
    choices[active].focus({preventScroll:true});
  });
  listen(window, 'scroll', queueScroll, {passive:true});
  listen(window, 'resize', () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      if (!alive) return;
      const indicator = {left:choices[active].offsetLeft,width:choices[active].offsetWidth};
      pill.style.width = `${indicator.width}px`;
      placeIndicator(indicator.left, true);
      queueScroll();
    });
  }, {passive:true});
  listen(finePointer, 'change', queueScroll);
  listen(preference, 'change', () => {
    if (preference.matches && frame) { window.cancelAnimationFrame(frame); frame = 0; }
  });
  let observer, imageObserver;
  if ('IntersectionObserver' in window) {
    // Decode near the viewport so the incoming illustration is painted before
    // it grows. Keep below-fold images lazy in the server-rendered document.
    imageObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || !alive) return;
      images.forEach(figure => {
        const image = figure.querySelector('img');
        image.loading = 'eager';
        image.decode?.().catch(() => {});
      });
      imageObserver.disconnect();
    }, {rootMargin:'350px 0px'});
    imageObserver.observe(root);
    observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible && !root.contains(document.activeElement)) manual = false;
      if (visible) queueScroll();
    });
    observer.observe(root);
  }

  const cleanup = () => {
    alive = false;
    observer?.disconnect();
    imageObserver?.disconnect();
    window.cancelAnimationFrame(frame);
    window.cancelAnimationFrame(readyFrame);
    window.cancelAnimationFrame(resizeFrame);
    disposers.forEach(dispose => dispose());
    slides.forEach(slide => {
      slide.inert = false;
      slide.removeAttribute('aria-hidden');
      slide.removeAttribute('data-active');
      slide.style.removeProperty('z-index');
      const image = slide.querySelector('.dg-image');
      image.style.removeProperty('transform');
      image.style.removeProperty('opacity');
    });
    delete root.dataset.galleryEnhanced;
    delete root.dataset.galleryReady;
    delete root.dataset.galleryDirection;
    root.removeAttribute('aria-roledescription');
    root.style.removeProperty('--dg-duration');
    count.style.removeProperty('transform');
    pill.style.removeProperty('transform');
    pill.style.removeProperty('width');
    status.textContent = '';
    controls.hidden = true;
    galleries.delete(root);
  };
  galleries.set(root, cleanup);
  return cleanup;
}

export function initDiagonalGalleries(scope = document) {
  const cleanups = [...scope.querySelectorAll('[data-diagonal-gallery]')].map(initDiagonalGallery);
  return () => cleanups.forEach(cleanup => cleanup());
}
