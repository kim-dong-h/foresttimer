import React from 'react';
import { t } from './i18n.js';

export default function ResetPrompt({ onContinue, onReset, language, spiritImage }) {
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
      <img className="reset-prompt-spirit" src={spiritImage} alt="" />
    </div>
  );
}
