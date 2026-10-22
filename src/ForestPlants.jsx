import React, { memo, useEffect, useMemo, useState } from 'react';
import { FOREST_SLOTS, PLANT_WIDTH_FACTORS } from './forestGrowth.js';
import { forestPlantAssets } from './forestPlantAssets.js';
import { FOREST_PIXEL_SIZE, loadPlantTextures } from './forestPlantTextures.js';

function ForestPlants({ plants, foreground = false, assets = forestPlantAssets }) {
  const [loaded, setLoaded] = useState(null);
  const textures = loaded?.assets === assets ? loaded.textures : null;
  const visiblePlants = useMemo(() => plants.filter(({ slot }) => (FOREST_SLOTS[slot].y > 808) === foreground)
    .sort((a, b) => FOREST_SLOTS[a.slot].y - FOREST_SLOTS[b.slot].y), [plants, foreground]);
  // A stable key prevents reloading when timer ticks preserve the same plants.
  const requestKey = useMemo(() => JSON.stringify([...new Set(visiblePlants.map(({ kind, slot }) => {
    const pixels = Math.max(6, Math.min(64, Math.round(FOREST_SLOTS[slot].width * PLANT_WIDTH_FACTORS[kind] / FOREST_PIXEL_SIZE)));
    return `${kind}:${pixels}`;
  }))].sort()), [visiblePlants]);
  useEffect(() => {
    let active = true;
    const requests = JSON.parse(requestKey).map(key => {
      const [kind, pixels] = key.split(':');
      return { kind, pixels: Number(pixels) };
    });
    if (requests.length) loadPlantTextures(assets, requests).then(value => {
      if (active) setLoaded({ assets, textures: value });
    });
    return () => { active = false; };
  }, [assets, requestKey]);
  return (
    <g className="forest-plants" pointerEvents="none" aria-hidden="true">
      {visiblePlants
        .map(({ kind, slot }) => {
          const { x, y, width, brightness = 1, opacity = 1 } = FOREST_SLOTS[slot];
          const widthFactor = PLANT_WIDTH_FACTORS[kind];
          const pixels = Math.max(6, Math.min(64, Math.round(width * widthFactor / FOREST_PIXEL_SIZE)));
          const texture = textures?.[kind]?.get(pixels);
          const { image, geometry } = texture || assets[kind];
          const scale = width * widthFactor / geometry.bounds.width;
          return (
            <g key={slot} className="forest-plant" data-object={kind} data-plant-slot={slot} data-source-image={assets[kind].image} data-scene-pixel-size={texture ? FOREST_PIXEL_SIZE : undefined}>
              <ellipse cx={x} cy={y - 2} rx={width * widthFactor * 0.28} ry={width * 0.04} fill="#4a4d2a" opacity={0.13 * opacity} />
              <image href={image} x={x - geometry.groundAnchor.x * scale} y={y - geometry.groundAnchor.y * scale} width={geometry.canvasWidth * scale} height={geometry.canvasHeight * scale} opacity={opacity} style={{ filter: `saturate(.82) brightness(${brightness})`, imageRendering: texture ? 'pixelated' : 'auto' }} />
            </g>
          );
        })}
    </g>
  );
}

export default memo(ForestPlants);
