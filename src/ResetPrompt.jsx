import React from 'react';
import rabbitSprite from './assets/rabbit-rain-umbrella-sprite.png';
import rabbitGeometry from './assets/rabbit-rain-umbrella-sprite.json';
import { t } from './i18n.js';

export default function ResetPrompt({ onContinue, onReset, language }) {
  const { x, y, width, height } = rabbitGeometry.bounds;
  return (
    <div
      id="reset-prompt"
      className="reset-prompt"
      role="dialog"
      aria-labelledby="reset-prompt-message"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onContinue();
        }
      }}
    >
      <div className="reset-prompt-bubble">
        <p id="reset-prompt-message">{t(language, 'focusQuestPrompt')}</p>
        <div className="reset-prompt-actions">
          <button type="button" autoFocus onClick={onContinue}>{t(language, 'continue')}</button>
          <button type="button" onClick={onReset}>{t(language, 'resetNow')}</button>
        </div>
      </div>
      <svg className="reset-prompt-rabbit" viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true">
        <image href={rabbitSprite} width={rabbitGeometry.canvasWidth} height={rabbitGeometry.canvasHeight} />
      </svg>
    </div>
  );
}
