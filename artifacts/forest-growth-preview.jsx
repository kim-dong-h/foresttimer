import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import CampScene from '../src/CampScene.jsx';
import TamagotchiStatus from '../src/TamagotchiStatus.jsx';
import { SpiritTracker, TAMAGOTCHI_KEY, evolutionStage } from '../src/tamagotchi.js';
import { spiritImages } from '../src/tamagotchiAssets.js';
import '../src/styles.css';

// Preview uses isolated in-memory storage, never the visitor's real progress.
function makePreview() {
  const values = new Map([[TAMAGOTCHI_KEY, JSON.stringify({ version: 1, species: 'sprout-spirit', totalMilliseconds: 0, lastCreditedAt: 0 })]]);
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let seed = 8431;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  return { storage, tracker: new SpiritTracker(storage, random), clock: 1000 };
}

function Preview() {
  const [session, setSession] = useState(makePreview);
  const [profile, setProfile] = useState(session.tracker.profile);
  const advance = (minutes) => {
    session.tracker.begin(session.clock + minutes * 60000, session.clock);
    session.clock += minutes * 60000;
    session.tracker.stop(session.clock);
    setProfile(session.tracker.profile);
  };
  const reset = () => { const next = makePreview(); setSession(next); setProfile(next.tracker.profile); };
  const restore = () => {
    const random = session.tracker.random;
    session.tracker = new SpiritTracker(session.storage, () => { throw new Error('Saved plants should not reroll'); });
    session.tracker.random = random;
    setProfile(session.tracker.profile);
  };
  const stage = evolutionStage(profile.totalMilliseconds);
  return <main style={{ padding: 0, margin: 0, width: 1536, maxWidth: 'none', position: 'relative', zIndex: 1, alignItems: 'stretch' }}>
    <nav style={{ padding: 12, background: '#e8e8ca', display: 'flex', gap: 12 }}>
      <button onClick={() => advance(15)}>15분 수행</button><button onClick={() => advance(30)}>30분 수행</button><button onClick={() => advance(6000)}>100시간 수행</button><button onClick={() => advance(24000)}>400시간 수행</button><button onClick={restore}>저장 복원 확인</button><button onClick={reset}>시안 처음부터</button>
    </nav>
    <CampScene language="ko" status="idle" rainActive={false} spiritImage={spiritImages[profile.species][stage]} spiritName="새싹 정령" spiritStage={stage} plants={profile.forestPlants} />
    <TamagotchiStatus language="ko" profile={profile} saved={session.tracker.saved} />
  </main>;
}
createRoot(document.getElementById('root')).render(<Preview />);
