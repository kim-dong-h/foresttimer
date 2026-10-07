import React from 'react';
import rabbitSprite from './assets/rabbit-rain-umbrella-sprite.png';
import rabbitGeometry from './assets/rabbit-rain-umbrella-sprite.json';

export default function ResetPrompt({ onContinue, onReset }) {
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
        <p id="reset-prompt-message">빗소리를 들으면서 조금 더 집중 하지 않을래?</p>
        <div className="reset-prompt-actions">
          <button type="button" autoFocus onClick={onContinue}>계속할게</button>
          <button type="button" onClick={onReset}>초기화할게</button>
        </div>
      </div>
      <svg className="reset-prompt-rabbit" viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true">
        <image href={rabbitSprite} width={rabbitGeometry.canvasWidth} height={rabbitGeometry.canvasHeight} />
      </svg>
    </div>
  );
}
