import test from 'node:test';
import assert from 'node:assert/strict';
import { gallerySettings, galleryIndex, galleryPose, scrollGalleryIndex, diagonalGalleryHtml } from '../lib/diagonal-gallery.mjs';
import { businessGalleryHtml } from '../lib/render-template.mjs';
import { commercialServices } from '../lib/commercial-services.mjs';

test('gallery selection stays in bounds even after large scroll jumps or invalid input', () => {
  for (const index of [-100, -1, 0, 1, 2, 100, NaN, Infinity]) {
    const selected = galleryIndex(index, 3);
    assert.ok(selected >= 0 && selected <= 2);
    assert.equal([0, 1, 2].filter(item => galleryPose(item, selected).scale === 1).length, 1);
  }
  assert.equal(scrollGalleryIndex(2000, 900, 110, 3), 0);
  assert.equal(scrollGalleryIndex(-2000, 900, 110, 3), 2);
  assert.equal(scrollGalleryIndex(448, 900, 110, 3), 1);
  assert.equal(galleryPose(0, 2).opacity, 0);
  assert.equal(galleryPose(1, 2).translate, -64);
  assert.equal(galleryPose(2, 1).translate, 64);
});

test('gallery parameters have finite safe bounds and preserve the requested settings', () => {
  assert.deepEqual(gallerySettings(), {step:110, duration:.9, thumb:22});
  assert.deepEqual(gallerySettings({step:110, duration:.9, thumb:22}), gallerySettings());
  assert.deepEqual(gallerySettings({step:NaN, duration:Infinity, thumb:'invalid'}), gallerySettings());
  const settings = gallerySettings({step:0, duration:-1, thumb:1000});
  assert.ok(settings.step > 0);assert.equal(settings.duration, 0);assert.ok(settings.thumb < 100);
  assert.equal(diagonalGalleryHtml({photos:[]}), '');
});

test('the gallery ships complete linked service content before JavaScript enhancement', () => {
  const html = businessGalleryHtml();
  for (const service of commercialServices) assert.ok(html.includes(`href="${service.path}"`));
  assert.equal((html.match(/data-gallery-slide\b/g) || []).length, commercialServices.length);
  assert.equal((html.match(/<h3>/g) || []).length, commercialServices.length);
  assert.match(html, /data-gallery-controls hidden/);
  assert.doesNotMatch(html, /<article[^>]*(?:inert|aria-hidden|hidden)/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /data-duration="0.9" data-thumb="22"/);
});
