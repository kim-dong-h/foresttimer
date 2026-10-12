import React, { useRef, useState } from 'react';
import { calculatePercent, formatWon, formatDollars } from './percent.js';
import AveragingSimulator from './AveragingSimulator.jsx';
import BrowserStorageNotice from './BrowserStorageNotice.jsx';
import { pt, percentTimerHref } from './percentI18n.js';
import './percent.css';

export default function PercentCalculator({ language = 'ko' }) {
  const [base, setBase] = useState('5000');
  const [percent, setPercent] = useState('10');
  const amountInput = useRef(null);
  const displayAmount = language === 'en' ? formatDollars : formatWon;
  const result = calculatePercent(base, percent);
  const missing = !base.trim() || !percent.trim();
  const baseInvalid = Boolean(base.trim()) && !calculatePercent(base, '0');
  const percentInvalid = Boolean(percent.trim()) && !calculatePercent('0', percent);
  const subtracting = result?.adjustment.startsWith('-');
  const adjustment = result ? displayAmount(result.adjustment.replace(/^-/, '')) : '—';
  const timerHref = percentTimerHref(window.location.pathname, language);

  function reset() {
    setBase('');
    setPercent('');
    amountInput.current?.focus();
  }

  return (
    <div className="app-shell percent-shell">
      <main className="percent-main">
        <header className="percent-intro">
          <a className="percent-back" href={timerHref}>← {pt(language, 'back')}</a>
          <p className="percent-eyebrow">FOREST TOOLS</p>
          <h1>{pt(language, 'title')}</h1>
          <p>{pt(language, 'intro')}</p>
        </header>

        <section className="percent-card" aria-label={pt(language, 'title')}>
          <div className="percent-card-header"><span>PERCENT CALCULATOR</span><span>{pt(language, 'live')}</span></div>
          <div className="percent-card-body">
            <div className="percent-inputs">
              <label htmlFor="percent-base">{pt(language, 'base')}
                <input ref={amountInput} id="percent-base" type="text" inputMode="decimal" maxLength={40} autoComplete="off" placeholder={pt(language, 'baseExample')} value={base} onChange={event => setBase(event.target.value)} aria-invalid={baseInvalid} aria-describedby={baseInvalid ? 'percent-input-error' : undefined} />
              </label>
              <label htmlFor="percent-rate">{pt(language, 'percent')}
                <span className="percent-rate-field"><input id="percent-rate" type="text" inputMode="text" maxLength={40} autoComplete="off" placeholder={pt(language, 'percentExample')} value={percent} onChange={event => setPercent(event.target.value)} aria-invalid={percentInvalid} aria-describedby={`percent-rate-help${percentInvalid ? ' percent-input-error' : ''}`} /><span aria-hidden="true">%</span></span>
              </label>
              <div className="percent-total-field">
                <span className="percent-result-label" id="percent-total-label">{pt(language, 'total')}</span>
                <output className="percent-total" htmlFor="percent-base percent-rate" aria-labelledby="percent-total-label" aria-live="polite">{result ? displayAmount(result.total) : '—'}</output>
              </div>
            </div>
            <p className="percent-help" id="percent-rate-help">{pt(language, 'percentHelp')}</p>
            {(baseInvalid || percentInvalid) && <p className="percent-error" id="percent-input-error" role="alert">{pt(language, 'inputError', { field: pt(language, baseInvalid ? 'base' : 'percent') })}</p>}

            <p className="percent-equation">{result ? `${pt(language, 'adjustment')} ${displayAmount(result.adjustment) === displayAmount('0') ? '' : subtracting ? '−' : '+'}${adjustment} · ${pt(language, 'total')} ${displayAmount(result.total)}` : missing ? pt(language, 'empty') : pt(language, 'invalid')}</p>

            <div className="percent-actions">
              <button type="button" className="percent-reset" onClick={reset}>{pt(language, 'reset')}</button>
            </div>
          </div>
        </section>
        <AveragingSimulator language={language} />
      </main>
      <BrowserStorageNotice language={language} />
      <footer><span>FORESTTIMER © 2026</span><span>{pt(language, 'footer')}</span></footer>
    </div>
  );
}
