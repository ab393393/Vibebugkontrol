const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;

export function gallerySettings({step = 110, duration = .9, thumb = 22} = {}) {
  return {step: number(step, 110, 40, 400), duration: number(duration, .9, 0, 2), thumb: number(thumb, 22, 12, 35)};
}
export function galleryIndex(index, count) {
  return Math.max(0, Math.min(Math.max(0, count - 1), Math.round(Number(index) || 0)));
}
export function galleryPose(index, active, thumb = 22) {
  const offset = index - active;
  return {translate: Math.max(-2, Math.min(2, offset)) * 64, scale: offset === 0 ? 1 : thumb / 100, opacity: Math.abs(offset) > 1 ? 0 : 1, layer: offset === 0 ? 3 : 2 - Math.min(2, Math.abs(offset))};
}
export function scrollGalleryIndex(center, viewportHeight, step, count) {
  return galleryIndex((viewportHeight * .62 - center) / step, count);
}

// The complete content and destinations are available without JavaScript.
// The browser enhancement changes only their presentation and selection.
export function diagonalGalleryHtml({photos, step = 110, duration = .9, thumb = 22, id = 'business-gallery'}) {
  if (!photos?.length) return '';
  const settings = gallerySettings({step, duration, thumb});
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const arrow = direction => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${direction === 'previous' ? 'M19 12H5m0 0 6 6m-6-6 6-6' : 'M5 12h14m0 0-6-6m6 6-6 6'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<div class="diagonal-gallery" id="${safeId}" data-diagonal-gallery data-step="${settings.step}" data-duration="${settings.duration}" data-thumb="${settings.thumb}" role="region" aria-label="Explore business pest care">
    <div class="dg-slides" id="${safeId}-slides">${photos.map((photo, index) => `<article class="dg-slide" data-gallery-slide aria-label="${index + 1} of ${photos.length}">
      <div class="dg-image-well"><figure class="dg-image"><img data-shared-image="${escape(photo.id || safeId+'-'+index)}" src="${escape(photo.src)}" srcset="${escape(photo.srcset)}" sizes="(max-width:760px) 66vw, 42vw" width="1536" height="1024" loading="lazy" decoding="async" alt="${escape(photo.alt)}"><figcaption class="illustration-label">Illustration</figcaption></figure></div>
      <div class="dg-copy"><p class="dg-kicker">${String(index + 1).padStart(2, '0')} / YOUR SPACE</p><h3><span>${escape(photo.title)}</span></h3><p>${escape(photo.description)}</p><ul class="visual-tags">${photo.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul><a class="text-link" href="${escape(photo.href)}">View service details <span aria-hidden="true">↗</span></a></div>
    </article>`).join('')}</div>
    <div class="dg-controls" data-gallery-controls hidden><div class="dg-choices" role="group" aria-label="Choose your business space"><span class="dg-selection-pill" data-gallery-pill aria-hidden="true"></span>${photos.map((photo, index) => `<button type="button" class="dg-choice" data-gallery-select="${index}" aria-label="Show ${escape(photo.title)}" aria-pressed="${index === 0}" aria-controls="${safeId}-slides"><img src="${escape(photo.thumbnail)}" width="48" height="32" loading="lazy" decoding="async" alt="${escape(photo.alt)}" aria-hidden="true"><span class="dg-choice-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div><p class="dg-control-hint">Choose your space</p><div class="dg-pagination"><span class="dg-count" aria-hidden="true"><span class="dg-count-window"><span class="dg-count-track" data-gallery-count>${photos.map((_,index)=>`<span>${String(index+1).padStart(2,'0')}</span>`).join('')}</span></span><span> / ${String(photos.length).padStart(2, '0')}</span></span><button type="button" class="dg-arrow" data-gallery-previous aria-label="Previous business space" aria-controls="${safeId}-slides">${arrow('previous')}</button><button type="button" class="dg-arrow" data-gallery-next aria-label="Next business space" aria-controls="${safeId}-slides">${arrow('next')}</button></div></div>
    <p class="sr-only" data-gallery-status role="status" aria-live="polite" aria-atomic="true"></p>
    <nav class="dg-service-links" aria-label="Business pest control services">${photos.map(photo => `<a href="${escape(photo.href)}">${escape(photo.linkLabel || photo.title)} <span aria-hidden="true">↗</span></a>`).join('')}</nav>
  </div>`;
}
