import React from 'react';
import nightCamp from './assets/night-camp-empty.png';
import dayCamp from './assets/day-camp-empty.png';
import rabbitSprite from './assets/rabbit-cup-sprite.png';
import rabbitGeometry from './assets/rabbit-cup-sprite.json';
import readingRabbitSprite from './assets/rabbit-book-sprite.png';
import readingRabbitGeometry from './assets/rabbit-book-sprite.json';
import rainDropSprite from './assets/rain-drop-sprite.png';
import rainDropGeometry from './assets/rain-drop-sprite.json';
import { t } from './i18n.js';

const rabbitHeight = 212;
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

function RabbitObject({ reading }) {
  const geometry = reading ? readingRabbitGeometry : rabbitGeometry;
  const sprite = reading ? readingRabbitSprite : rabbitSprite;
  const { x, y, width, height } = geometry.bounds;
  const rabbitWidth = rabbitHeight * width / height;
  return (
    <svg
      className="camp-rabbit-object"
      data-object="rabbit"
      x={480 - rabbitWidth / 2}
      y={794 - rabbitHeight}
      width={rabbitWidth}
      height={rabbitHeight}
      viewBox={`${x} ${y} ${width} ${height}`}
      aria-hidden="true"
    >
      <image
        href={sprite}
        width={geometry.canvasWidth}
        height={geometry.canvasHeight}
      />
    </svg>
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

export default function CampScene({ status, rainActive, mode, language }) {
  const reading = status === 'running';
  const focused = mode === 'focus';
  const campBackground = focused ? nightCamp : dayCamp;
  const timeOfDay = t(language, focused ? 'night' : 'day');
  return (
    <svg
      className={`camp-scene scene-${status}`}
      viewBox="0 0 1536 1024"
      width="1536"
      height="1024"
      role="img"
      aria-label={t(language, reading ? 'sceneBook' : 'sceneCup', { timeOfDay })}
    >
      <image href={campBackground} width="1536" height="1024" />
      <RabbitObject reading={reading} />
      {rainActive && <FallingRainDrops />}
    </svg>
  );
}
