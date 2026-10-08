import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import background from '../src/assets/spirit-forest-background.png';
import concept from '../src/assets/spirit-forest-soft-plants-400h.png';
import grass from '../src/assets/woodland-plants/soft-pixel-v2/grass.png';
import grassGeometry from '../src/assets/woodland-plants/soft-pixel-v2/grass.json';
import fern from '../src/assets/woodland-plants/soft-pixel-v2/fern.png';
import fernGeometry from '../src/assets/woodland-plants/soft-pixel-v2/fern.json';
import shrub from '../src/assets/woodland-plants/soft-pixel-v2/shrub.png';
import shrubGeometry from '../src/assets/woodland-plants/soft-pixel-v2/shrub.json';
import ForestPlants from '../src/ForestPlants.jsx';
import { growForest } from '../src/forestGrowth.js';
import { forestPlantAssets } from '../src/forestPlantAssets.js';
import { spiritImages } from '../src/tamagotchiAssets.js';
import '../src/styles.css';

const softAssets = {
  ...forestPlantAssets,
  'grass-tuft': { image: grass, geometry: grassGeometry },
  'woodland-fern': { image: fern, geometry: fernGeometry },
  'round-shrub': { image: shrub, geometry: shrubGeometry },
};

function Preview() {
  const [mode, setMode] = useState('three');
  const [showSpirit, setShowSpirit] = useState(false);
  const { currentPlants, threePlants } = useMemo(() => {
    let seed = 8431;
    const currentPlants = growForest([], 400 * 3600000, () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    });
    // Only the trial species selection changes. Preserve all runtime slot IDs,
    // positions, depth ordering, width factors and shadows for an honest preview.
    const kinds = ['grass-tuft', 'woodland-fern', 'round-shrub'];
    const threePlants = currentPlants.map(({ slot }) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return { slot, kind: kinds[Math.floor(seed / 4294967296 * kinds.length)] };
    });
    return { currentPlants, threePlants };
  }, []);
  const plants = mode === 'three' ? threePlants : currentPlants;
  return <main style={{ padding: 0, margin: 0, width: 1536, maxWidth: 'none', position: 'relative', zIndex: 1, alignItems: 'stretch' }}>
    <nav style={{ padding: 12, background: '#e8e8ca', display: 'flex', gap: 12, alignItems: 'center', color: '#293d32' }}>
      <button aria-pressed={mode === 'three'} onClick={() => setMode('three')}>새 식물 3종 실제 배치</button>
      <button aria-pressed={mode === 'five'} onClick={() => setMode('five')}>현재 5종에 새 PNG 적용</button>
      <button aria-pressed={mode === 'concept'} onClick={() => setMode('concept')}>이미지젠 시안</button>
      <label><input type="checkbox" checked={showSpirit} onChange={event => setShowSpirit(event.target.checked)} />정령 표시</label>
      <span>{mode === 'concept' ? '이미지젠으로 그린 시안' : '400시간 · 실제 PNG 800개 · 현재 좌표/크기/렌더러 사용'}</span>
    </nav>
    <svg className="camp-scene" viewBox="0 0 1536 1024" width="1536" height="1024" role="img" aria-label={mode === 'concept' ? '400시간 이미지젠 시안' : '400시간 실제 식물 PNG 배치'} data-preview-mode={mode}>
      <image href={mode === 'concept' ? concept : background} width="1536" height="1024" />
      {mode !== 'concept' && <ForestPlants plants={plants} assets={softAssets} />}
      {mode !== 'concept' && showSpirit && <image href={spiritImages['sprout-spirit'][3]} x={295} y={438} width={370} height={370} />}
      {mode !== 'concept' && <ForestPlants plants={plants} foreground assets={softAssets} />}
    </svg>
  </main>;
}
createRoot(document.getElementById('root')).render(<Preview />);
