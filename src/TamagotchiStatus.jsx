import React from 'react';
import { EVOLUTION_HOURS, evolutionProgress } from './tamagotchi.js';
import { formatPreset, t } from './i18n.js';
import { MAX_PLANTS, MAX_FOREST_HOURS, PLANT_INTERVAL_MS } from './forestGrowth.js';

export default function TamagotchiStatus({ language, profile, saved }) {
  const { stage, nextHours, fraction } = evolutionProgress(profile.totalMilliseconds);
  const total = formatPreset(Math.floor(profile.totalMilliseconds / 1000), language) || t(language, 'spiritZeroTime');
  const remaining = nextHours === null ? null : formatPreset(Math.ceil((nextHours * 3600000 - profile.totalMilliseconds) / 1000), language);
  const plantCount = profile.forestPlants.length;
  const forestComplete = plantCount === MAX_PLANTS;
  const nextPlant = formatPreset(Math.ceil((PLANT_INTERVAL_MS - profile.totalMilliseconds % PLANT_INTERVAL_MS) / 1000), language);
  return (
    <section className="spirit-status" aria-label={t(language, 'spiritGrowth')}>
      <div className="spirit-status-heading"><span>{t(language, 'spiritTotal')}</span><span className="spirit-stage" role="status">{t(language, stage === 0 ? 'spiritBase' : 'spiritStage', { stage })}</span></div>
      <strong className="spirit-total" data-total-milliseconds={profile.totalMilliseconds}>{total}</strong>
      <div className="spirit-progress" role="progressbar" aria-label={t(language, 'spiritGrowth')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(fraction * 100)} aria-valuetext={nextHours === null ? t(language, 'spiritFullyGrown') : t(language, 'spiritNext', { stage: stage + 1, time: remaining })}><span style={{ width: `${fraction * 100}%` }} /></div>
      <ol className="spirit-milestones" aria-label={t(language, 'spiritMilestones')}>{EVOLUTION_HOURS.map((hours, index) => <li key={hours} className={stage > index ? 'reached' : ''}><span aria-hidden="true">{stage > index ? '✦' : '◇'}</span> {t(language, 'spiritMilestone', { stage: index + 1, hours })}</li>)}</ol>
      <p>{nextHours === null ? t(language, 'spiritFullyGrown') : t(language, 'spiritNext', { stage: stage + 1, time: remaining })}</p>
      <div className="forest-growth-status">
        <div className="spirit-status-heading"><span>{t(language, 'forestGrowth')}</span><span role="status" data-plant-count={plantCount}>{t(language, 'forestPlantCount', { count: plantCount, max: MAX_PLANTS })}</span></div>
        <div className="spirit-progress" role="progressbar" aria-label={t(language, 'forestGrowth')} aria-valuemin={0} aria-valuemax={MAX_PLANTS} aria-valuenow={plantCount}><span style={{ width: `${plantCount / MAX_PLANTS * 100}%` }} /></div>
        <p>{forestComplete ? t(language, 'forestComplete', { hours: MAX_FOREST_HOURS }) : t(language, 'forestNextPlant', { time: nextPlant, hours: MAX_FOREST_HOURS })}</p>
      </div>
      {!saved && <p className="spirit-storage-message" role="status">{t(language, 'spiritStorageBlocked')}</p>}
    </section>
  );
}
