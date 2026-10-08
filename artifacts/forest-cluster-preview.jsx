import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CampScene from '../src/CampScene.jsx';
import { growForest } from '../src/forestGrowth.js';
import { evolutionStage } from '../src/tamagotchi.js';
import { spiritImages } from '../src/tamagotchiAssets.js';
import concept from '../src/assets/spirit-forest-soft-plants-400h.png';
import previous from './forest-soft-plants-runtime-400h-with-spirit.jpg';
import '../src/styles.css';

function Preview() {
  const [hours, setHours] = useState(400);
  const [mode, setMode] = useState('actual');
  const plants = useMemo(() => {
    let seed = 8431;
    return growForest([], hours * 3600000, () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    });
  }, [hours]);
  const stage = evolutionStage(hours * 3600000);
  return <main style={{ padding: 0, margin: 0, width: 1536, maxWidth: 'none', position: 'relative', zIndex: 1, alignItems: 'stretch' }}>
    <nav style={{ padding: 12, background: '#e8e8ca', display: 'flex', gap: 12, alignItems: 'center', color: '#293d32' }}>
      <button aria-pressed={mode === 'actual'} onClick={() => setMode('actual')}>새 알고리즘 실제 배치</button>
      <button aria-pressed={mode === 'previous'} onClick={() => setMode('previous')}>이전 실제 배치</button>
      <button aria-pressed={mode === 'concept'} onClick={() => setMode('concept')}>이미지젠 시안</button>
      <label>누적 시간 <select value={hours} onChange={event => { setHours(Number(event.target.value)); setMode('actual'); }}>
        {[0, 20, 100, 200, 400].map(value => <option key={value} value={value}>{value}시간</option>)}
      </select></label>
      <span>{mode === 'actual' ? `${hours}시간 · 실제 식물 ${plants.length}개 · 서비스와 동일한 렌더러` : '400시간 비교 화면'}</span>
    </nav>
    {mode === 'actual' ? <CampScene status="idle" rainActive={false} language="ko" spiritImage={spiritImages['sprout-spirit'][stage]} spiritName="새싹 정령" spiritStage={stage} plants={plants} />
      : <img src={mode === 'concept' ? concept : previous} alt={mode === 'concept' ? '400시간 이미지젠 시안' : '이전 알고리즘 실제 400시간 배치'} width="1536" height="1024" style={{ display: 'block' }} />}
  </main>;
}
createRoot(document.getElementById('root')).render(<Preview />);
