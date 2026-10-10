import React, { useId } from 'react';
import forestBackground from './assets/spirit-forest-background.png';
import rainDropSprite from './assets/rain-drop-sprite.png';
import rainDropGeometry from './assets/rain-drop-sprite.json';
import { t } from './i18n.js';
import ForestPlants from './ForestPlants.jsx';

const rainDrops = [
  { x: 72, size: 29, delay: '-2.4s', duration: '3.2s' },
  { x: 188, size: 24, delay: '-.8s', duration: '2.8s' },
  { x: 310, size: 33, delay: '-1.7s', duration: '3.4s' },
  { x: 430, size: 26, delay: '-.3s', duration: '3s' },
  { x: 560, size: 35, delay: '-2.9s', duration: '3.5s' },
  { x: 690, size: 25, delay: '-1.2s', duration: '2.9s' },
  { x: 810, size: 31, delay: '-.6s', duration: '3.3s' },
  { x: 940, size: 23, delay: '-2.1s', duration: '2.7s' },
  { x: 1070, size: 34, delay: '-1.4s', duration: '3.6s' },
  { x: 1210, size: 27, delay: '-.1s', duration: '3.1s' },
  { x: 1350, size: 32, delay: '-2.7s', duration: '3.4s' },
  { x: 1470, size: 24, delay: '-1s', duration: '2.8s' },
];

function SpiritObject({ image, stage }) {
  const size = 310 + stage * 20;
  return (
    <image
      className="camp-spirit-object"
      data-object="spirit"
      data-evolution-stage={stage}
      x={480 - size / 2}
      y={808 - size}
      width={size}
      height={size}
      href={image}
      aria-hidden="true"
    />
  );
}

function FallingRainDrops() {
  const { x, y, width, height } = rainDropGeometry.bounds;
  return (
    <g className="camp-rain-drops" pointerEvents="none" aria-hidden="true">
      {rainDrops.map((drop, index) => {
        const dropHeight = drop.size * height / width;
        return (
          <svg key={index} className="camp-raindrop" x={drop.x - drop.size / 2} y={-dropHeight} width={drop.size} height={dropHeight} viewBox={`${x} ${y} ${width} ${height}`}>
            <animateTransform attributeName="transform" type="translate" from="0 -90" to="0 1220" dur={drop.duration} begin={drop.delay} repeatCount="indefinite" />
            <image href={rainDropSprite} width={rainDropGeometry.canvasWidth} height={rainDropGeometry.canvasHeight} />
          </svg>
        );
      })}
    </g>
  );
}

export default function CampScene({ status, rainActive, language, spiritImage, spiritName, spiritStage, plants = [], focusMode = false }) {
  const lightingId = useId();
  const sunlightId = `forest-focus-sunlight-${lightingId}`;
  const timeOfDay = t(language, 'day');
  return (
    <svg
      className={`camp-scene scene-${status}${focusMode ? ' is-focus-mode' : ''}`}
      viewBox="0 0 1536 1024"
      width="1536"
      height="1024"
      role="img"
      aria-label={t(language, 'spiritScene', { timeOfDay, name: spiritName })}
    >
      <defs>
        <radialGradient id={sunlightId} gradientUnits="userSpaceOnUse" cx="520" cy="320" r="620">
          <stop offset="0%" stopColor="#ffe6a2" stopOpacity=".04" />
          <stop offset="55%" stopColor="#ffe6a2" stopOpacity=".02" />
          <stop offset="100%" stopColor="#ffe6a2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <image className="camp-forest-background" href={forestBackground} width="1536" height="1024" />
      <g className={`camp-focus-lighting${focusMode ? ' is-active' : ''}`} pointerEvents="none" aria-hidden="true">
        <rect width="1536" height="1024" fill={`url(#${sunlightId})`} />
      </g>
      <ForestPlants plants={plants} />
      <SpiritObject image={spiritImage} stage={spiritStage} />
      <ForestPlants plants={plants} foreground />
      {rainActive && <FallingRainDrops />}
    </svg>
  );
}
