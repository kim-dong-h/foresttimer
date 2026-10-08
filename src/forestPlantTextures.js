// Sample plant art onto the scene's pixel grid at render time. Original PNGs
// remain intact; generated canvases are tiny transparent display textures.
const textureCache = new WeakMap();
export const FOREST_PIXEL_SIZE = 3;

export function loadPlantTextures(assets) {
  if (textureCache.has(assets)) return textureCache.get(assets);
  const pending = Promise.all(Object.entries(assets).map(async ([kind, asset]) => {
    const source = await new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = asset.image;
    });
    const variants = new Map();
    if (!source) return [kind, variants];
    const { bounds, groundAnchor } = asset.geometry;
    for (let pixels = 6; pixels <= 64; pixels += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = pixels;
      canvas.height = Math.max(1, Math.round(pixels * bounds.height / bounds.width));
      const context = canvas.getContext('2d');
      if (!context) break;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, canvas.width, canvas.height);
      variants.set(pixels, {
        image: canvas.toDataURL('image/png'),
        geometry: {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          bounds: { x: 0, y: 0, width: canvas.width, height: canvas.height },
          groundAnchor: { x: (groundAnchor.x - bounds.x) / bounds.width * canvas.width, y: canvas.height },
        },
      });
    }
    return [kind, variants];
  })).then(entries => Object.fromEntries(entries));
  textureCache.set(assets, pending);
  return pending;
}
