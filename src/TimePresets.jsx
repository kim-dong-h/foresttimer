import React, { useEffect, useRef, useState } from 'react';
import { addPreset, DEFAULT_PRESET_SECONDS, loadPresets, MAX_PRESETS, PRESETS_KEY, removePreset } from './presets.js';
import { MAX_TIMER_MINUTES } from './timer.js';
import { formatSavedPreset, t } from './i18n.js';

function presetError(error, language) {
  if (language !== 'en') return error;
  if (error.startsWith('0~')) return t(language, 'presetInvalid', { minutes: MAX_TIMER_MINUTES });
  if (error.startsWith('1초~')) return t(language, 'presetRange', { minutes: MAX_TIMER_MINUTES });
  if (error === '이미 저장된 시간이에요.') return t(language, 'presetDuplicate');
  if (error.startsWith('시간은 최대')) return t(language, 'presetLimit', { count: MAX_PRESETS });
  if (error === '기본 30분은 삭제할 수 없어요.') return t(language, 'presetDefault');
  if (error === '저장된 시간을 찾을 수 없어요.') return t(language, 'presetMissing');
  return error;
}

export default function TimePresets({ duration, running, onSelect, language }) {
  const [presets, setPresets] = useState(() => {
    try { return loadPresets(window.localStorage); } catch { return [DEFAULT_PRESET_SECONDS]; }
  });
  const [adding, setAdding] = useState(false);
  const [minutesInput, setMinutesInput] = useState('');
  const [secondsInput, setSecondsInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const addButton = useRef(null);
  const full = presets.length >= MAX_PRESETS;

  useEffect(() => { if (running) setAdding(false); }, [running]);

  function cancel() {
    setAdding(false);
    setError('');
    setMinutesInput('');
    setSecondsInput('');
    addButton.current?.focus();
  }

  function save(event) {
    event.preventDefault();
    if (running) return;
    const result = addPreset(presets, minutesInput, secondsInput);
    if (result.error) {
      setError(presetError(result.error, language));
      return;
    }
    let saved = true;
    try { window.localStorage.setItem(PRESETS_KEY, JSON.stringify(result.presets.map((seconds) => ({ seconds })))); } catch { saved = false; }
    setPresets(result.presets);
    setAdding(false);
    setMinutesInput('');
    setSecondsInput('');
    setError('');
    const label = formatSavedPreset(result.seconds, language);
    setMessage(saved ? t(language, 'savedNotice', { label }) : t(language, 'storageBlocked'));
    onSelect(result.seconds);
  }

  function remove(value) {
    if (running) return;
    const result = removePreset(presets, value);
    if (result.error) {
      setMessage(presetError(result.error, language));
      return;
    }
    let saved = true;
    try { window.localStorage.setItem(PRESETS_KEY, JSON.stringify(result.presets.map((seconds) => ({ seconds })))); } catch { saved = false; }
    setPresets(result.presets);
    if (duration === value * 1000) onSelect(DEFAULT_PRESET_SECONDS);
    const label = formatSavedPreset(value, language);
    setMessage(saved ? t(language, 'deleteNotice', { label }) : t(language, 'deleteStorageBlocked'));
  }

  return (
    <>
      <div className="preset-label"><span>{t(language, 'selectFocusTime')}</span><span>{presets.length} / {MAX_PRESETS} {t(language, 'saved')}</span></div>
      <div className="presets" aria-label={t(language, 'selectFocusTime')}>
        {presets.map((value) => <div key={value} className={`preset-item${value !== DEFAULT_PRESET_SECONDS ? ' has-delete' : ''}`}>
          <button type="button" className={`preset-select${duration === value * 1000 ? ' selected' : ''}`} aria-label={formatSavedPreset(value, language)} disabled={running} aria-pressed={duration === value * 1000} onClick={() => onSelect(value)}>
            <span className="preset-indicator" aria-hidden="true">{duration === value * 1000 ? '▶' : '·'}</span><span className="preset-details"><span className="preset-time">{formatSavedPreset(value, language).split(' ').map(unit => <span key={unit}>{unit}</span>)}</span><small>{value === DEFAULT_PRESET_SECONDS ? t(language, 'basic') : t(language, 'saved')}</small></span>
          </button>
          {value !== DEFAULT_PRESET_SECONDS && <button type="button" className="preset-delete" aria-label={`${formatSavedPreset(value, language)} ${t(language, 'delete')}`} title={`${formatSavedPreset(value, language)} ${t(language, 'delete')}`} disabled={running} onClick={() => remove(value)}><span aria-hidden="true">×</span></button>}
        </div>)}
        {!full && <button ref={addButton} type="button" className="preset-add" aria-label={t(language, 'addFocusTime')} aria-expanded={adding} aria-controls={adding ? 'preset-editor' : undefined} disabled={running} title={t(language, 'wantedTime')} onClick={() => { setAdding(true); setMinutesInput(''); setSecondsInput(''); setError(''); setMessage(''); }}>
          <span><span className="preset-plus" aria-hidden="true">+</span><small>{t(language, 'add')}</small></span>
        </button>}
      </div>
      {adding && <form id="preset-editor" className="preset-editor" onSubmit={save} onKeyDown={(event) => { if (event.key === 'Escape') cancel(); }}>
        <label htmlFor="preset-minutes">{t(language, 'addTime')} <small>({t(language, 'maxMinutes', { minutes: MAX_TIMER_MINUTES })})</small></label>
        <div className="preset-editor-row">
          <input id="preset-minutes" type="number" min="0" max={MAX_TIMER_MINUTES} step="1" autoFocus value={minutesInput} onChange={(event) => { setMinutesInput(event.target.value); setError(''); }} aria-describedby={error ? 'preset-error' : undefined} aria-invalid={Boolean(error)} />
          <span>{t(language, 'minute')}</span><input id="preset-seconds" type="number" min="0" max="59" step="1" value={secondsInput} onChange={(event) => { setSecondsInput(event.target.value); setError(''); }} aria-label={t(language, 'second')} aria-describedby={error ? 'preset-error' : undefined} aria-invalid={Boolean(error)} /><span>{t(language, 'second')}</span><button type="submit">{t(language, 'save')}</button><button type="button" onClick={cancel}>{t(language, 'cancel')}</button>
        </div>
        {error && <p id="preset-error" className="preset-feedback" role="alert">{error}</p>}
      </form>}
      {!adding && (message || full) && <p className="preset-feedback" role="status">{message || t(language, 'presetFull', { count: MAX_PRESETS })}</p>}
    </>
  );
}
