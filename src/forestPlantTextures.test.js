import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPlantTextures } from './forestPlantTextures.js';

test('an empty forest needs no browser APIs, image downloads or canvases', async () => {
  assert.deepEqual(await loadPlantTextures({}), {});
});

test('visible sizes share one download and one canvas per size across concurrent layers', async () => {
  const originalImage = globalThis.Image;
  const originalDocument = globalThis.document;
  const downloads = [];
  let canvases = 0;
  globalThis.Image = class {
    set src(url) { downloads.push(url); queueMicrotask(() => this.onload()); }
  };
  globalThis.document = { createElement(type) {
    assert.equal(type, 'canvas');
    canvases += 1;
    return { getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/png;base64,texture' };
  } };
  const geometry = { bounds: { x: 10, y: 5, width: 100, height: 200 }, groundAnchor: { x: 60, y: 205 } };
  const assets = { grass: { image: '/grass.webp', geometry }, fern: { image: '/unused-fern.webp', geometry } };
  try {
    const [back, front] = await Promise.all([
      loadPlantTextures(assets, [{ kind: 'grass', pixels: 12 }, { kind: 'grass', pixels: 18 }]),
      loadPlantTextures(assets, [{ kind: 'grass', pixels: 12 }]),
    ]);
    assert.deepEqual(downloads, ['/grass.webp']);
    assert.equal(canvases, 2);
    assert.equal(back.grass.get(12), front.grass.get(12));
    assert.equal(back.grass.get(18).geometry.canvasHeight, 36);
    assert.equal(back.grass.get(12).geometry.groundAnchor.x, 6);
    await loadPlantTextures(assets, [{ kind: 'grass', pixels: 18 }]);
    assert.equal(canvases, 2);
    assert.deepEqual(downloads, ['/grass.webp']);
  } finally {
    if (originalImage === undefined) delete globalThis.Image; else globalThis.Image = originalImage;
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
  }
});
