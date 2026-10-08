import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import original from '../src/assets/spirit-forest-background.png';
import candidate from '../src/assets/spirit-forest-sprite-style.png';
import ForestPlants from '../src/ForestPlants.jsx';
import { growForest } from '../src/forestGrowth.js';
import { evolutionStage } from '../src/tamagotchi.js';
import { spiritImages } from '../src/tamagotchiAssets.js';
import '../src/styles.css';

function Preview() {
  const [useCandidate, setUseCandidate] = useState(true);
  const [hours, setHours] = useState(20);
  const allPlants = useMemo(() => {
    let seed = 8431;
    return growForest([], 400 * 3600000, () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; });
  }, []);
  const plants = allPlants.slice(0, hours * 2);
  const stage = evolutionStage(hours * 3600000);
  const size = 310 + stage * 20;
  return <main style={{ padding: 0, margin: 0, width: 1536, maxWidth: 'none', position: 'relative', zIndex: 1, alignItems: 'stretch' }}>
    <nav style={{ padding: 12, background: '#e8e8ca', display: 'flex', gap: 12, color: '#293d32' }}>
      <button aria-pressed={!useCandidate} onClick={() => setUseCandidate(false)}>기존 배경</button><button aria-pressed={useCandidate} onClick={() => setUseCandidate(true)}>식물 도트풍 배경 시안</button>
      <button aria-pressed={hours === 20} onClick={() => setHours(20)}>식물 40개</button><button aria-pressed={hours === 400} onClick={() => setHours(400)}>식물 800개</button>
      <span>{useCandidate ? '새 배경 시안' : '기존 배경'} · 같은 원본 PNG와 같은 배치</span>
    </nav>
    <svg className="camp-scene" viewBox="0 0 1536 1024" width="1536" height="1024" role="img" aria-label={useCandidate ? '식물 도트풍 배경의 실제 PNG 배치 시안' : '기존 배경의 실제 PNG 배치'}>
      <image href={useCandidate ? candidate : original} width="1536" height="1024" />
      <ForestPlants plants={plants} />
      <image href={spiritImages['sprout-spirit'][stage]} x={480 - size / 2} y={808 - size} width={size} height={size} />
      <ForestPlants plants={plants} foreground />
    </svg>
  </main>;
}
createRoot(document.getElementById('root')).render(<Preview />);
