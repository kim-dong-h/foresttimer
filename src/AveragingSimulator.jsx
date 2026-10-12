import React, { useState } from 'react';
import { simulateAveraging } from './percent.js';
import SavedSimulations from './SavedSimulations.jsx';

import { pt, moneyLabel, investmentLabel, currencyForLanguage } from './percentI18n.js';

export default function AveragingSimulator({ language = 'ko' }) {
  const [basePrice, setBasePrice] = useState(language === 'en' ? '100' : '100000');
  const [dropPercent, setDropPercent] = useState('7');
  const [profitPercent, setProfitPercent] = useState('7');
  const currency = currencyForLanguage(language);
  const simulation = simulateAveraging(basePrice, dropPercent, profitPercent, currency);
  const missing = !basePrice.trim() || !dropPercent.trim() || !profitPercent.trim();
  const priceInvalid = Boolean(basePrice.trim()) && !simulateAveraging(basePrice, '0');
  const dropInvalid = Boolean(dropPercent.trim()) && !simulateAveraging('1', dropPercent);
  const profitInvalid = Boolean(profitPercent.trim()) && !simulateAveraging('1', '0', profitPercent);

  return (
    <section className="percent-card simulator-card" aria-labelledby="simulator-title">
      <div className="percent-card-header"><h2 id="simulator-title">{pt(language, 'simulator')}</h2><span>{pt(language, 'tenSteps')}</span></div>
      <div className="percent-card-body">
        <p className="simulator-intro">{pt(language, 'simulatorIntro')}</p>
        <div className="percent-inputs simulator-inputs">
          <label htmlFor="simulator-base">{pt(language, 'base')} <small>{pt(language, 'perShare')}</small>
            <input id="simulator-base" type="text" inputMode="decimal" maxLength={40} autoComplete="off" value={basePrice} placeholder={pt(language, 'priceExample')} onChange={event => setBasePrice(event.target.value)} aria-invalid={priceInvalid} aria-describedby={priceInvalid ? 'simulator-error' : undefined} />
          </label>
          <label htmlFor="simulator-drop">{pt(language, 'drop')}
            <span className="percent-rate-field"><input id="simulator-drop" type="text" inputMode="text" maxLength={40} autoComplete="off" value={dropPercent} placeholder={pt(language, 'dropExample')} onChange={event => setDropPercent(event.target.value)} aria-invalid={dropInvalid} aria-describedby={`simulator-rate-help${dropInvalid ? ' simulator-error' : ''}`} /><span aria-hidden="true">%</span></span>
          </label>
          <label htmlFor="simulator-profit">{pt(language, 'profit')}
            <span className="percent-rate-field"><input id="simulator-profit" type="text" inputMode="text" maxLength={40} autoComplete="off" value={profitPercent} placeholder={pt(language, 'profitExample')} onChange={event => setProfitPercent(event.target.value)} aria-invalid={profitInvalid} aria-describedby={`simulator-profit-help${profitInvalid ? ' simulator-error' : ''}`} /><span aria-hidden="true">%</span></span>
          </label>
        </div>
        <p className="percent-help" id="simulator-rate-help">{pt(language, 'dropHelp')}</p>
        <p className="percent-help" id="simulator-profit-help">{pt(language, 'profitHelp')}</p>
        {(priceInvalid || dropInvalid || profitInvalid) && <p className="percent-error" id="simulator-error" role="alert">{pt(language, priceInvalid ? 'priceError' : dropInvalid ? 'dropError' : 'profitError')}</p>}

        <SavedSimulations language={language} values={{ basePrice, dropPercent, profitPercent }} canSave={Boolean(simulation)} onLoad={record => { setBasePrice(record.basePrice); setDropPercent(record.dropPercent); setProfitPercent(record.profitPercent); }} />

        {simulation ? <>
          <p className="simulator-summary" role="status">{pt(language, 'summary', { price: moneyLabel(simulation.basePrice, language), drop: simulation.dropPercent, profit: simulation.profitPercent })}</p>
          <p className="simulator-scroll-hint">{pt(language, 'scroll')}</p>
          <div className="simulator-table-scroll" role="region" aria-label={pt(language, 'plan')} tabIndex={0}>
            <table className="simulator-table">
              <caption className="sr-only">{pt(language, 'caption')}</caption>
              <thead><tr><th scope="col">{pt(language, 'step')}</th><th scope="col">{pt(language, 'buyPrice')}</th><th scope="col">{pt(language, 'investment')}</th><th scope="col">{pt(language, 'cumulative')}</th><th scope="col">{pt(language, 'average')}</th><th scope="col">{pt(language, 'target')}</th><th scope="col">{pt(language, 'expected')}</th></tr></thead>
              <tbody>{simulation.rows.map(row => <tr key={row.step}>
                <th scope="row">{pt(language, 'stepNumber', { step: row.step })}{row.step === 1 && <small>{pt(language, 'first')}</small>}</th>
                <td className="simulator-price">{moneyLabel(row.displayPrice, language)}</td>
                <td>{investmentLabel(row.purchaseAmount, language)}</td>
                <td>{investmentLabel(row.cumulativeInvestment, language)}</td>
                <td className="simulator-price">{moneyLabel(row.averagePrice, language)}</td>
                <td className="simulator-target">{moneyLabel(row.targetPrice, language)}</td>
                <td className="simulator-profit">{moneyLabel(row.expectedProfit, language) !== moneyLabel('0', language) && !row.expectedProfit.startsWith('-') ? '+' : ''}{moneyLabel(row.expectedProfit, language)}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="percent-help">{pt(language, 'planHelp')}</p>
          <p className="percent-help">{pt(language, 'averageHelp')}</p>
        </> : <p className="simulator-empty" role="status">{pt(language, missing ? 'planEmpty' : 'planInvalid')}</p>}
      </div>
    </section>
  );
}
