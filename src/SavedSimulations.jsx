import React, { useEffect, useRef, useState } from 'react';
import { pt, moneyLabel, currencyForLanguage } from './percentI18n.js';
import { loadSavedSimulations, saveSimulation, SAVED_SIMULATIONS_KEY } from './savedSimulations.js';

function readSaved(language) {
  try { return loadSavedSimulations(window.localStorage, currencyForLanguage(language)); } catch { return []; }
}

function SaveDialog({ language, values, onCancel, onSaved }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    titleRef.current.focus();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    let result;
    try { result = saveSimulation(window.localStorage, title, values, language); }
    catch { result = { error: pt(language, 'saveError') }; }
    if (result.error) { setError(result.error); return; }
    onSaved(result);
  }

  return <dialog ref={dialogRef} className="simulation-save-dialog" aria-labelledby="simulation-save-title" onCancel={event => { event.preventDefault(); onCancel(); }}>
    <form onSubmit={submit}>
      <h2 id="simulation-save-title">{pt(language, 'saveTitle')}</h2>
      <p className="percent-help">{pt(language, 'saveHelp')}</p>
      <label htmlFor="simulation-save-name">{pt(language, 'name')}</label>
      <input ref={titleRef} id="simulation-save-name" type="text" value={title} maxLength={60} autoComplete="off" onChange={event => { setTitle(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'simulation-save-error' : undefined} />
      {error && <p className="percent-error" role="alert" id="simulation-save-error">{error}</p>}
      <div className="percent-actions simulation-save-actions">
        <button type="button" onClick={onCancel}>{pt(language, 'cancel')}</button>
        <button type="submit" className="percent-reset">{pt(language, 'save')}</button>
      </div>
    </form>
  </dialog>;
}

export default function SavedSimulations({ language = 'ko', values, canSave, onLoad }) {
  const [records, setRecords] = useState(() => readSaved(language));
  const [pendingValues, setPendingValues] = useState(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const refresh = event => {
      if (event.key === SAVED_SIMULATIONS_KEY || event.key === null) setRecords(readSaved(language));
    };
    setRecords(readSaved(language));
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [language]);

  return <div className="simulator-saved">
    <div className="percent-actions simulator-save-toolbar">
      <button type="button" className="percent-reset" disabled={!canSave} aria-haspopup="dialog" aria-expanded={Boolean(pendingValues)} onClick={() => setPendingValues({ ...values })}>{pt(language, 'save')}</button>
      {notice && <p className="simulator-save-notice" role="status">{notice}</p>}
    </div>
    {records.length > 0 && <section className="simulator-saved-list" aria-labelledby="saved-simulations-title">
      <h3 id="saved-simulations-title">{pt(language, 'savedTitle')}</h3>
      <p className="percent-help">{pt(language, 'savedHelp')}</p>
      <ul>{records.map(record => <li key={record.id}>
        <button type="button" onClick={() => { onLoad(record); setNotice(pt(language, 'loaded', { title: record.title })); }}>
          <strong>{record.title}</strong>
          <span>{pt(language, 'savedValues', { price: moneyLabel(record.basePrice, language), drop: record.dropPercent, profit: record.profitPercent })}</span>
        </button>
      </li>)}</ul>
    </section>}
    {pendingValues && <SaveDialog language={language} values={pendingValues} onCancel={() => setPendingValues(null)} onSaved={({ records: saved, record }) => { setRecords(saved); setPendingValues(null); setNotice(pt(language, 'saved', { title: record.title })); }} />}
  </div>;
}
