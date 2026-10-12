// Keep the original art's pixels and sample only the display sizes in use.
// Background and foreground layers share source downloads and canvas results.
const sourceCache = new WeakMap();
const textureCache = new WeakMap();
export const FOREST_PIXEL_SIZE = 3;

function assetCache(cache, assets) {
  if (!cache.has(assets)) cache.set(assets, new Map());
  return cache.get(assets);
}

function loadSource(assets, kind) {
  const sources = assetCache(sourceCache, assets);
  if (!sources.has(kind)) {
    sources.set(kind, new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = assets[kind].image;
    }));
  }
  return sources.get(kind);
}

function sampleTexture(source, geometry, pixels) {
  if (!source) return null;
  const { bounds, groundAnchor } = geometry;
  const canvas = document.createElement('canvas');
  canvas.width = pixels;
  canvas.height = Math.max(1, Math.round(pixels * bounds.height / bounds.width));
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, canvas.width, canvas.height);
  return {
    image: canvas.toDataURL('image/png'),
    geometry: {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      bounds: { x: 0, y: 0, width: canvas.width, height: canvas.height },
      groundAnchor: { x: (groundAnchor.x - bounds.x) / bounds.width * canvas.width, y: canvas.height },
    },
  };
}

export async function loadPlantTextures(assets, requests = []) {
  const cache = assetCache(textureCache, assets);
  const result = {};
  await Promise.all(requests.map(async ({ kind, pixels }) => {
    if (!assets[kind] || !Number.isInteger(pixels) || pixels < 6 || pixels > 64) return;
    if (!cache.has(kind)) cache.set(kind, new Map());
    const variants = cache.get(kind);
    if (!variants.has(pixels)) {
      variants.set(pixels, loadSource(assets, kind).then(source => sampleTexture(source, assets[kind].geometry, pixels)));
    }
    const texture = await variants.get(pixels);
    if (!result[kind]) result[kind] = new Map();
    if (texture) result[kind].set(pixels, texture);
  }));
  return result;
}
