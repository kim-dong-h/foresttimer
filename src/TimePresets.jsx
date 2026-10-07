import React, { useEffect, useRef, useState } from 'react';
import { addPreset, DEFAULT_PRESET_SECONDS, loadPresets, MAX_PRESETS, PRESETS_KEY, removePreset } from './presets.js';
import { MAX_TIMER_MINUTES } from './timer.js';

function formatPreset(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  return [[hours, '시간'], [minutes, '분'], [seconds, '초']].filter(([value]) => value).map(([value, unit]) => `${value}${unit}`).join(' ');
}

function objectForm(label) {
  const lastCode = label.charCodeAt(label.length - 1) - 0xac00;
  const hasFinalConsonant = lastCode >= 0 && lastCode <= 11171 && lastCode % 28 !== 0;
  return `${label}${hasFinalConsonant ? '을' : '를'}`;
}

export default function TimePresets({ duration, running, onSelect }) {
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
      setError(result.error);
      return;
    }
    let saved = true;
    try { window.localStorage.setItem(PRESETS_KEY, JSON.stringify(result.presets.map((seconds) => ({ seconds })))); } catch { saved = false; }
    setPresets(result.presets);
    setAdding(false);
    setMinutesInput('');
    setSecondsInput('');
    setError('');
    setMessage(saved ? `${objectForm(formatPreset(result.seconds))} 저장했어요.` : '시간을 추가했지만 브라우저 저장이 차단되어 새로고침하면 사라져요.');
    onSelect(result.seconds);
  }

  function remove(value) {
    if (running) return;
    const result = removePreset(presets, value);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    let saved = true;
    try { window.localStorage.setItem(PRESETS_KEY, JSON.stringify(result.presets.map((seconds) => ({ seconds })))); } catch { saved = false; }
    setPresets(result.presets);
    if (duration === value * 1000) onSelect(DEFAULT_PRESET_SECONDS);
    setMessage(saved ? `${objectForm(formatPreset(value))} 삭제했어요.` : '시간을 삭제했지만 브라우저 저장이 차단되어 새로고침하면 다시 나타날 수 있어요.');
  }

  return (
    <>
      <div className="preset-label"><span>집중 시간 선택</span><span>{presets.length} / {MAX_PRESETS} 저장</span></div>
      <div className="presets" aria-label="빠른 시간 설정">
        {presets.map((value) => <div key={value} className="preset-item">
          <button type="button" className={`preset-select${duration === value * 1000 ? ' selected' : ''}`} aria-label={formatPreset(value)} disabled={running} aria-pressed={duration === value * 1000} onClick={() => onSelect(value)}>
            <span className="preset-indicator" aria-hidden="true">{duration === value * 1000 ? '▶' : '·'}</span><span>{formatPreset(value)}<small>{value === DEFAULT_PRESET_SECONDS ? '기본' : '저장'}</small></span>
          </button>
          {value !== DEFAULT_PRESET_SECONDS && <button type="button" className="preset-delete" aria-label={`${formatPreset(value)} 삭제`} disabled={running} onClick={() => remove(value)}>×</button>}
        </div>)}
        {!full && <button ref={addButton} type="button" className="preset-add" aria-label="집중 시간 추가" aria-expanded={adding} aria-controls={adding ? 'preset-editor' : undefined} disabled={running} title="원하는 시간 추가" onClick={() => { setAdding(true); setMinutesInput(''); setSecondsInput(''); setError(''); setMessage(''); }}>
          <span><span className="preset-plus" aria-hidden="true">+</span><small>추가</small></span>
        </button>}
      </div>
      {adding && <form id="preset-editor" className="preset-editor" onSubmit={save} onKeyDown={(event) => { if (event.key === 'Escape') cancel(); }}>
        <label htmlFor="preset-minutes">추가할 시간 <small>(최대 {MAX_TIMER_MINUTES}분)</small></label>
        <div className="preset-editor-row">
          <input id="preset-minutes" type="number" min="0" max={MAX_TIMER_MINUTES} step="1" autoFocus value={minutesInput} onChange={(event) => { setMinutesInput(event.target.value); setError(''); }} aria-describedby={error ? 'preset-error' : undefined} aria-invalid={Boolean(error)} />
          <span>분</span><input id="preset-seconds" type="number" min="0" max="59" step="1" value={secondsInput} onChange={(event) => { setSecondsInput(event.target.value); setError(''); }} aria-label="초" aria-describedby={error ? 'preset-error' : undefined} aria-invalid={Boolean(error)} /><span>초</span><button type="submit">저장</button><button type="button" onClick={cancel}>취소</button>
        </div>
        {error && <p id="preset-error" className="preset-feedback" role="alert">{error}</p>}
      </form>}
      {!adding && (message || full) && <p className="preset-feedback" role="status">{message || `기본 30분을 포함해 최대 ${MAX_PRESETS}개의 시간이 저장되어 있어요.`}</p>}
    </>
  );
}
