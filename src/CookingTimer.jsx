import React, { useEffect, useReducer, useRef, useState } from 'react';
import { formatTime } from './timer.js';
import { formatPreset } from './i18n.js';
import { SoundController } from './sounds.js';
import { useNotifications } from './useNotifications.js';
import { SiteLinks, SiteNavigation } from './SiteNavigation.jsx';
import { siteHref } from './siteRoutes.js';
import { COOKING_PRESETS, COOKING_STORAGE_KEY, MAX_COOKING_TIMERS, MAX_COOKING_DURATION,
  cookingDuration, cookingRemaining, cookingReducer, createCookingTimer, initialCookingTimers, loadCookingTimers } from './cooking.js';

function FoodIcon({ kind = 'pot', size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" shapeRendering="crispEdges">
    {kind === 'egg' ? <><path d="M12 4h8v4h4v8h3v10h-4v3H9v-3H5V16h3V8h4Z" fill="#fff7dc" stroke="currentColor" strokeWidth="2" /><path d="M12 17h8v9h-8Z" fill="#e7b65a" /></>
      : kind === 'tea' ? <><path d="M8 3v5m8-7v6m7-4v5" stroke="#aaae8e" strokeWidth="2" /><path d="M5 12h19v14H9v-4H5Z" fill="#e6dda9" stroke="currentColor" strokeWidth="2" /><path d="M24 14h5v8h-5M5 29h23" stroke="currentColor" strokeWidth="2" /><path d="M9 15h11v4H9Z" fill="#8da16a" /></>
      : <><path d="M10 2v5m6-7v6m6-4v5" stroke="#aaae8e" strokeWidth="2" /><path d="M4 15h24v8h-4v5H8v-5H4Z" fill={kind === 'noodles' ? '#e7bc70' : '#a0b381'} stroke="currentColor" strokeWidth="2" /><path d="M1 15h30M9 11h14v4M14 8h5v3" stroke="currentColor" strokeWidth="2" />{['noodles', 'pasta'].includes(kind) && <path d="M9 18h3v5m4-5h3v7m3-7h3" stroke="#fff2c2" strokeWidth="2" />}</>}
  </svg>;
}

function KitchenScene() {
  return <svg className="cooking-scene" viewBox="0 0 220 115" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M0 105h220v10H0Z" fill="#172f27" /><path d="M20 100h170v5H20Z" fill="#8e9b72" />
    <path d="M35 73h97v27H35Z" fill="#4c6850" /><path d="M38 77h90v5H38Z" fill="#76835d" /><path d="M47 88h12v6H47Zm54 0h12v6h-12Z" fill="#e6c277" />
    <path d="M49 40h67v23h-5v10H54V63h-5Z" fill="#d9b774" /><path d="M54 44h57v5H54Z" fill="#f1d99c" /><path d="M42 40h81v5H42Zm14-6h53v6H56Zm20-6h14v6H76Z" fill="#a8b883" />
    <path className="kitchen-steam" d="M65 22V12h5V2m14 19V9h5V0m14 23V13h5V3" stroke="#b8c5a2" strokeWidth="3" fill="none" />
    <path d="M151 72h32v28h-32Z" fill="#b97650" /><path d="M148 69h38v7h-38Z" fill="#dbab75" /><path d="M167 69V29m0 24h-10V43h-8V33h10v10h8m0 0h10V32h10V22h-10v10h-10m0 30h13V52h10V42h-10v10h-13" stroke="#92ac77" strokeWidth="5" />
  </svg>;
}

export default function CookingTimer() {
  const [timers, dispatch] = useReducer(cookingReducer, undefined, initialCookingTimers);
  const [now, setNow] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [presetId, setPresetId] = useState('ramen');
  const [name, setName] = useState('라면');
  const [minutes, setMinutes] = useState('4');
  const [seconds, setSeconds] = useState('0');
  const [feedback, setFeedback] = useState('');
  const [sound] = useState(() => new SoundController());
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [repeat, setRepeat] = useState(true);
  const notifications = useNotifications('ko', soundEnabled);
  const notify = useRef(notifications.notifyCompletion);
  notify.current = notifications.notifyCompletion;
  const notified = useRef(new Set());
  const composerName = useRef(null);
  const hasRunning = timers.some(timer => timer.status === 'running');
  const ringing = timers.filter(timer => timer.status === 'finished' && !timer.acknowledged);
  const ringingKey = ringing.map(timer => `${timer.id}:${timer.completions}`).join('|');
  const nextTimer = timers.filter(timer => timer.status === 'running').sort((a, b) => a.deadline - b.deadline)[0];

  useEffect(() => {
    const current = Date.now();
    setNow(current);
    try { dispatch({ type: 'restore', timers: loadCookingTimers(localStorage, current) }); }
    catch { setStorageBlocked(true); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(COOKING_STORAGE_KEY, JSON.stringify(timers)); }
    catch { setStorageBlocked(true); }
  }, [timers, loaded]);

  useEffect(() => {
    if (!hasRunning) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      dispatch({ type: 'tick', now: current });
    };
    tick();
    const interval = setInterval(tick, 250);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', tick);
    };
  }, [hasRunning]);

  useEffect(() => {
    if (!loaded) return;
    let play = false;
    for (const timer of ringing) {
      const key = `${timer.id}:${timer.completions}`;
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      play = true;
      void notify.current({ title: `${timer.name} · 요리 타이머 완료`, body: '설정한 시간이 끝났어요. 요리를 확인해 주세요.', tag: `cooking-${timer.id}` });
    }
    if (play) sound.playCompletion();
  }, [ringingKey, loaded, sound]);

  useEffect(() => {
    if (!ringingKey || !repeat || !soundEnabled) return;
    const interval = setInterval(() => sound.playCompletion(), 5000);
    return () => clearInterval(interval);
  }, [ringingKey, repeat, soundEnabled, sound]);

  useEffect(() => () => sound.dispose(), [sound]);
  useEffect(() => {
    document.title = ringing.length ? `${ringing.map(timer => timer.name).join(', ')} 완료! | 요리 타이머`
      : nextTimer ? `${formatTime(cookingRemaining(nextTimer, now))} ${nextTimer.name} | 요리 타이머`
        : '요리 타이머 – 라면·파스타·여러 요리 동시 알림 | forestTimer';
  }, [timers, now]);

  function act(type, id) {
    const current = Date.now();
    if (type === 'toggle' || type === 'extend') void sound.prepare();
    setNow(current);
    dispatch({ type, id, now: current });
  }

  function selectPreset(preset) {
    setPresetId(preset.id);
    setName(preset.name);
    setMinutes(String(preset.minutes));
    setSeconds('0');
    setFeedback('');
  }

  function addTimer(event) {
    event.preventDefault();
    const duration = cookingDuration(minutes, seconds);
    if (!name.trim()) { setFeedback('요리 이름을 입력해 주세요.'); composerName.current?.focus(); return; }
    if (!duration) { setFeedback('시간은 1초부터 360분까지, 분과 초는 정수로 입력해 주세요.'); return; }
    if (timers.length >= MAX_COOKING_TIMERS) { setFeedback('타이머는 최대 6개예요. 사용하지 않는 타이머를 삭제해 주세요.'); return; }
    const preset = COOKING_PRESETS.find(preset => preset.id === presetId);
    dispatch({ type: 'add', timer: createCookingTimer(crypto.randomUUID(), name, duration, preset?.icon) });
    setFeedback(`${name.trim()} 타이머를 추가했어요. 타이머의 시작 버튼을 눌러 주세요.`);
  }

  return <div className="cooking-shell">
    <SiteNavigation current="cooking" pathname="/cooking/" />
    <header className="cooking-header">
      <a className="cooking-brand" href="../">forestTimer<span>숲속 작은 주방</span></a>
    </header>
    <main className="cooking-main">
      <section className="cooking-hero" aria-labelledby="cooking-title">
        <div><p className="cooking-eyebrow"><span /> FOREST KITCHEN</p><h1 id="cooking-title">요리 타이머<br /><em>맛있는 기다림의 시작.</em></h1><p>라면부터 한 상의 요리까지.<br className="cooking-mobile-break" /> 여러 요리를 각자의 시간에 맞춰 알려드려요.</p></div>
        <KitchenScene />
      </section>
      <div className="cooking-workspace">
        <section className="cooking-prep" aria-labelledby="prep-title">
          <div className="cooking-section-heading"><span className="cooking-step">01</span><h2 id="prep-title">요리 타이머 준비</h2></div>
          <p className="cooking-subtext">자주 하는 요리의 시간부터 골라보세요.</p>
          <div className="cooking-presets" role="group" aria-label="요리별 기본 시간">
            {COOKING_PRESETS.map(preset => <button key={preset.id} type="button" aria-pressed={presetId === preset.id} onClick={() => selectPreset(preset)}>
              <FoodIcon kind={preset.icon} /><span>{preset.name}<strong>{preset.minutes}<small>분</small></strong></span>
            </button>)}
          </div>
          <p className="cooking-preset-note">{COOKING_PRESETS.find(preset => preset.id === presetId)?.note || '나만의 조리 시간을 설정하세요.'} · 시간은 자유롭게 바꿀 수 있어요.</p>
          <form className="cooking-form" onSubmit={addTimer}>
            <label htmlFor="cooking-name">요리 이름</label>
            <input id="cooking-name" ref={composerName} type="text" maxLength="32" value={name} onChange={event => setName(event.target.value)} placeholder="예: 냄비 속 카레" required />
            <fieldset><legend>조리 시간</legend><div className="cooking-time-inputs">
              <label><span className="sr-only">분</span><input type="number" inputMode="numeric" min="0" max="360" step="1" value={minutes} onChange={event => setMinutes(event.target.value)} /><span>분</span></label>
              <span aria-hidden="true">:</span>
              <label><span className="sr-only">초</span><input type="number" inputMode="numeric" min="0" max="59" step="1" value={seconds} onChange={event => setSeconds(event.target.value)} /><span>초</span></label>
            </div></fieldset>
            <button className="cooking-add" type="submit" disabled={!loaded || timers.length >= MAX_COOKING_TIMERS}><span aria-hidden="true">＋</span> 타이머 추가 <span>{timers.length} / {MAX_COOKING_TIMERS}</span></button>
            <p className="cooking-feedback" role="status">{feedback || (timers.length >= MAX_COOKING_TIMERS ? '타이머가 가득 찼어요. 사용하지 않는 타이머를 삭제해 주세요.' : '추가한 뒤 시작 버튼을 누르면 시간이 흘러요.')}</p>
          </form>
        </section>
        <section className="cooking-timers" aria-labelledby="timers-title">
          <div className="cooking-section-heading"><span className="cooking-step">02</span><h2 id="timers-title">내 요리 타이머</h2><span className="cooking-running-count">{timers.filter(timer => timer.status === 'running').length}개 조리 중</span></div>
          <div className="cooking-timer-list">
            {timers.map((timer, index) => {
              const remaining = cookingRemaining(timer, now);
              const running = timer.status === 'running';
              const finished = timer.status === 'finished';
              const alarm = finished && !timer.acknowledged;
              return <article key={timer.id} className={`cooking-timer cooking-timer-${timer.status}${alarm ? ' is-ringing' : ''}`} aria-labelledby={`name-${timer.id}`}>
                <div className="cooking-timer-top"><span className="cooking-pot-number">POT {String(index + 1).padStart(2, '0')}</span><span className="cooking-status">{alarm ? '완료! 요리를 확인해 주세요' : finished ? '완료 확인' : running ? '조리 중' : timer.status === 'paused' ? '일시정지' : '준비 완료'}</span><button type="button" className="cooking-remove" aria-label={`${timer.name} 타이머 삭제`} title="타이머 삭제" onClick={() => act('remove', timer.id)}>×</button></div>
                <div className="cooking-timer-body"><div className="cooking-food-label"><FoodIcon kind={timer.icon} size={34} /><div><h3 id={`name-${timer.id}`}>{timer.name}</h3><p>설정 {formatPreset(timer.duration / 1000, 'ko')}</p></div></div><output className="cooking-countdown" role="timer" aria-live="off" aria-label={`${timer.name} 남은 시간 ${formatTime(remaining)}`}>{formatTime(remaining)}</output></div>
                <div className="cooking-progress" aria-hidden="true"><span style={{ width: `${remaining / timer.duration * 100}%` }} /></div>
                <div className="cooking-timer-actions">
                  {alarm ? <button className="cooking-primary" type="button" onClick={() => act('acknowledge', timer.id)}>✓ 완료 확인 · 알림 끄기</button>
                    : <button className="cooking-primary" type="button" disabled={!loaded} onClick={() => act('toggle', timer.id)}><span aria-hidden="true">{running ? 'Ⅱ' : '▶'}</span> {running ? '일시정지' : timer.status === 'paused' ? '이어서 시작' : finished ? '다시 시작' : '시작'}</button>}
                  <button type="button" disabled={timer.duration >= MAX_COOKING_DURATION} onClick={() => act('extend', timer.id)} aria-label={`${timer.name} 1분 추가`}>＋ 1분</button>
                  <button type="button" onClick={() => act('reset', timer.id)} aria-label={`${timer.name} 초기화`}>↺ 초기화</button>
                </div>
              </article>;
            })}
            {!timers.length && <div className="cooking-empty"><FoodIcon size={45} /><h3>다음 요리를 준비해 볼까요?</h3><p>요리를 골라 타이머를 추가해 주세요.</p><button type="button" onClick={() => composerName.current?.focus()}>요리 이름 입력하기 ↑</button></div>}
          </div>
          <div className="sr-only" role="status">{ringing.map(timer => `${timer.name} 타이머가 완료됐어요.`).join(' ')}</div>
          <section className="cooking-alerts" aria-labelledby="alerts-title">
            <h3 id="alerts-title">주방 알림 설정</h3>
            <div className="cooking-switches"><button type="button" role="switch" aria-checked={soundEnabled} onClick={() => { void sound.prepare(); sound.setEnabled(!sound.enabled); setSoundEnabled(sound.enabled); }}>알림 소리 <span>{soundEnabled ? 'ON' : 'OFF'}</span></button><button type="button" role="switch" aria-checked={repeat} onClick={() => setRepeat(!repeat)}>5초마다 반복 <span>{repeat ? 'ON' : 'OFF'}</span></button></div>
            <div className="cooking-browser-alert"><span>브라우저 완료 알림</span><div>{notifications.enabled && <button type="button" onClick={notifications.test} disabled={notifications.busy}>테스트</button>}<button type="button" role="switch" aria-checked={notifications.enabled} aria-label="브라우저 완료 알림" aria-describedby="cooking-alert-help" disabled={!notifications.available || notifications.busy} onClick={notifications.toggle}>{notifications.busy ? '준비 중' : notifications.enabled ? '켜짐' : '켜기'}</button></div></div>
            <p id="cooking-alert-help">{notifications.help}</p>{notifications.message && <p role="status">{notifications.message}</p>}
          </section>
        </section>
      </div>
      <aside className="cooking-note"><span aria-hidden="true">✦</span><p>기본 조리 시간은 시작을 돕는 예시예요. 제품 설명, 재료의 양과 원하는 익힘에 맞게 조절해 주세요.</p></aside>
      {storageBlocked && <p className="cooking-storage-warning" role="status">브라우저 저장이 차단되어 새로고침하면 타이머가 사라질 수 있어요.</p>}
      <section className="cooking-guide" aria-labelledby="guide-title"><div><p className="cooking-eyebrow">A LITTLE KITCHEN GUIDE</p><h2 id="guide-title">요리 타이머 사용 방법</h2><p>설치 없이 사용하는 온라인 요리 타이머입니다. 라면, 파스타, 달걀 등 여러 요리의 시간을 따로 설정하고 한 화면에서 확인하세요.</p></div><div className="cooking-guide-content">
        <details open><summary>여러 요리를 동시에 재려면?</summary><p>기본 시간을 선택하고 요리 이름과 분·초를 조절한 뒤 타이머를 추가하세요. 최대 6개까지 각각 시작하고 일시정지할 수 있어요. 조리 중에는 ‘＋ 1분’으로 시간을 늘리세요.</p></details>
        <details><summary>시간이 끝나면 어떻게 알려주나요?</summary><p>완료된 카드의 색이 바뀌고 알림음이 울려요. 반복을 켜면 5초마다 소리가 나며 ‘완료 확인 · 알림 끄기’를 누르면 멈춥니다. 브라우저 알림은 권한을 허용한 경우 요리 이름과 함께 표시됩니다.</p><p>타이머 탭을 열어 두세요. 탭을 닫거나 기기가 잠들면 알림이 울리지 않거나 늦어질 수 있어요.</p></details>
        <details><summary>새로고침해도 시간이 유지되나요?</summary><p>타이머는 현재 브라우저에 저장됩니다. 새로고침하면 종료 시각을 기준으로 남은 시간을 다시 계산해요. 닫혀 있는 동안 완료된 타이머는 페이지를 다시 열 때 확인할 수 있습니다. 브라우저 데이터를 지우면 저장 내용도 사라집니다.</p></details>
      </div><noscript><p>타이머를 실행하려면 JavaScript를 켜 주세요.</p></noscript></section>
      <section className="cooking-guide-detail"><h2>다른 요리의 종료 시각을 맞추고 싶나요?</h2><p>10분 파스타와 6분 소스를 함께 준비하는 예제로 카드별 시작, +1분, 완료 확인과 저장 복원을 확인해 보세요.</p><a href={siteHref('cookingGuide', 'ko', '/cooking/')}>요리 타이머 상세 가이드 읽기 →</a></section>
    </main>
    <footer className="cooking-footer"><span>FORESTTIMER © 2026 · 맛있는 기다림</span><a href="../">숲속 집중 타이머로 가기 →</a></footer>
    <SiteLinks pathname="/cooking/" />
  </div>;
}
