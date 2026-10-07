import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { durationFromInputs, formatTime, remainingAt, MAX_TIMER_MINUTES } from './timer.js';
import { useNotifications } from './useNotifications.js';
import CampScene from './CampScene.jsx';
import ResetPrompt from './ResetPrompt.jsx';
import ReturnHistory from './ReturnHistory.jsx';
import { useReturnHistory } from './useReturnHistory.js';
import TimePresets from './TimePresets.jsx';
import { DEFAULT_MINUTES } from './presets.js';
import lightRain from './assets/light-rain.mp3';
import './styles.css';

function Icon({ name, size = 20, ...props }) {
  const pixels = {
    clock: ['..####..','...##...','..####..','.##..##.','#..#...#','#..###.#','.##..##.','..####..'],
    play: ['.#......','.###....','.#####..','.#######','.#######','.#####..','.###....','.#......'],
    pause: ['.##..##.','.##..##.','.##..##.','.##..##.','.##..##.','.##..##.','.##..##.','.##..##.'],
    reset: ['..####..','.##..##.','##.....#','####...#','........','#......#','.##..##.','..####..'],
    leaf: ['....####','..######','.####.##','###..###','##.####.','#.####..','.###....','#.......'],
    check: ['......##','.....###','....###.','#..###..','#####...','.###....','..#.....','........'],
    bell: ['...##...','..####..','.##..##.','.##..##.','.##..##.','########','........','...##...'],
    star: ['...##...','...##...','########','.######.','..####..','.######.','.##..##.','#......#'],
    heart: ['.##..##.','########','########','########','.######.','..####..','...##...','........'],
  };
  return <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" {...props}>
    {pixels[name].flatMap((row, y) => [...row].map((pixel, x) => pixel === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))}
  </svg>;
}

function App() {
  const [minutes, setMinutes] = useState(String(DEFAULT_MINUTES));
  const [seconds, setSeconds] = useState('00');
  const [duration, setDuration] = useState(DEFAULT_MINUTES * 60 * 1000);
  const [remaining, setRemaining] = useState(duration);
  const [status, setStatus] = useState('idle');
  const [mode, setMode] = useState('normal');
  const [resetPromptOpen, setResetPromptOpen] = useState(false);
  const resetButton = useRef(null);
  const deadline = useRef(0);
  const audioContext = useRef(null);
  const rainAudio = useRef(null);
  const rainSource = useRef(null);
  const completed = useRef(false);
  const [rainActive, setRainActive] = useState(false);
  const notifications = useNotifications();
  const returnHistory = useReturnHistory();
  const notifyCompletion = useRef(notifications.notifyCompletion);
  notifyCompletion.current = notifications.notifyCompletion;
  const running = status === 'running';
  const focusMode = mode === 'focus';
  const progress = duration ? remaining / duration : 0;

  function stopRain() {
    const audio = rainAudio.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    rainSource.current = null;
    setRainActive(false);
  }

  function stopResetRain() {
    if (rainSource.current === 'reset') stopRain();
  }

  function startRain(source) {
    const audio = rainAudio.current ?? new Audio(lightRain);
    rainAudio.current = audio;
    audio.loop = true;
    audio.volume = 0.3;
    if (!audio.paused) {
      setRainActive(true);
      return false;
    }
    rainSource.current = source;
    setRainActive(true);
    audio.play().catch(() => {
      // A browser may block audio in unusual embedded contexts. The timer still works.
    });
    return true;
  }

  function toggleRain() {
    if (rainActive) {
      stopRain();
      return;
    }
    startRain('manual');
  }

  function finishTimer() {
    if (completed.current) return;
    completed.current = true;
    returnHistory.stop();
    stopResetRain();
    setRemaining(0);
    setStatus('finished');
    setResetPromptOpen(false);
    playCompletionSound();
    void notifyCompletion.current();
  }

  function playCompletionSound() {
    const context = audioContext.current;
    if (!context || context.state !== 'running') return;
    try {
      [0, 0.25, 0.5].forEach((delay) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.frequency.value = 740;
        const start = context.currentTime + delay;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        oscillator.start(start);
        oscillator.stop(start + 0.22);
      });
    } catch { /* Audio is optional; the visual completion always remains available. */ }
  }

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const next = remainingAt(deadline.current, Date.now());
      setRemaining(next);
      if (next === 0) {
        clearInterval(interval);
        finishTimer();
      }
    };
    const interval = setInterval(tick, 100);
    const onVisibility = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [running]);

  useEffect(() => () => {
    const audio = rainAudio.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    document.title = status === 'idle' ? 'forestTimer' : `${formatTime(remaining)} · ${status === 'finished' ? '완료!' : status === 'paused' ? '일시정지' : '집중 중'} — forestTimer`;
  }, [remaining, status]);

  function configure(nextMinutes, nextSeconds) {
    returnHistory.stop();
    stopResetRain();
    setResetPromptOpen(false);
    completed.current = false;
    const nextDuration = durationFromInputs(nextMinutes, nextSeconds);
    setMinutes(nextMinutes);
    setSeconds(nextSeconds);
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setStatus('idle');
  }

  function toggleTimer() {
    setResetPromptOpen(false);
    if (running) {
      const next = remainingAt(deadline.current, Date.now());
      if (next === 0) {
        finishTimer();
        return;
      }
      setRemaining(next);
      returnHistory.stop();
      stopResetRain();
      setStatus('paused');
      return;
    }
    const next = status === 'finished' ? duration : remaining;
    if (next <= 0) return;
    completed.current = false;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio && !audioContext.current) audioContext.current = new Audio();
      audioContext.current?.resume().catch(() => {});
    } catch { /* Browsers without Web Audio still support the timer. */ }
    setRemaining(next);
    deadline.current = Date.now() + next;
    if (focusMode) returnHistory.begin(deadline.current, status !== 'paused');
    else returnHistory.stop();
    setStatus('running');
  }

  function resetTimer() {
    returnHistory.stop();
    stopResetRain();
    setResetPromptOpen(false);
    completed.current = false;
    setRemaining(duration);
    setStatus('idle');
    resetButton.current?.focus();
  }

  function requestReset() {
    if (focusMode && (status === 'running' || status === 'paused')) {
      if (running) startRain('reset');
      setResetPromptOpen(true);
      return;
    }
    resetTimer();
  }

  function continueTimer() {
    setResetPromptOpen(false);
    resetButton.current?.focus();
  }

  function selectMode(nextMode) {
    setMode(nextMode);
    if (nextMode !== 'focus') {
      returnHistory.stop();
      stopResetRain();
      setResetPromptOpen(false);
      return;
    }
    if (running) returnHistory.begin(deadline.current, true);
  }

  const statusText = { idle: '준비됐나요? 오늘의 집중 퀘스트를 시작하세요.', running: '모닥불이 타오르는 동안, 지금에 집중하세요.', paused: '잠깐 쉬어가도 괜찮아요. 모험은 기다려줄게요.', finished: '퀘스트 완료! 수고했어요. 잠시 쉬어가세요.' }[status];

  return (
    <>
      <div className="app-shell">
      <main>
        <div className="intro">
          <h1>forestTimer</h1>
        </div>

        <section className={`timer-card is-${status}`} aria-label="타이머">
          <div className="card-top">
            <span><Icon name="clock" size={16} /> FOCUS QUEST</span>
            <span className={`status-badge ${running ? 'active' : ''}`}><span />{{ idle: 'READY', running: 'PLAYING', paused: 'PAUSED', finished: 'CLEAR!' }[status]}</span>
            <div className="mode-picker" role="group" aria-label="모드 선택">
              <button type="button" aria-pressed={mode === 'normal'} onClick={() => selectMode('normal')}>일반</button>
              <button type="button" aria-pressed={focusMode} onClick={() => selectMode('focus')}>집중</button>
            </div>
          </div>
          <div className="game-layout">
            <div className="controls-panel">
              <div className="mission-heading"><span className="mission-number">QUEST 01</span><span>지금 하는 일에 집중하기</span></div>
              <div className="timer-display">
                <div className="display-top"><span>{status === 'finished' ? 'QUEST COMPLETE' : 'TIME REMAINING'}</span><Icon name={status === 'finished' ? 'star' : 'clock'} size={14} /></div>
                <div className={`time${formatTime(remaining).length > 5 ? ' time-long' : ''}`} role="timer" aria-label={`남은 시간 ${formatTime(remaining)}`} aria-live="off">{formatTime(remaining)}</div>
                <div className="progress-hud" aria-hidden="true"><span>TIME</span><div className="progress-segments">{Array.from({ length: 20 }, (_, index) => <i key={index} className={index < Math.ceil(progress * 20) ? 'filled' : ''} />)}</div></div>
                <div className="display-bottom"><span>{status === 'finished' ? 'WELL DONE, ADVENTURER!' : 'ONE THING AT A TIME'}</span><span>{Math.ceil(progress * 100)}%</span></div>
              </div>
              <TimePresets duration={duration} running={running} onSelect={(totalSeconds) => configure(String(Math.floor(totalSeconds / 60)), String(totalSeconds % 60).padStart(2, '0'))} />
              <div className="custom-time"><span className="custom-label">직접 설정</span><div className="time-fields"><label><input type="number" min="0" max={MAX_TIMER_MINUTES} step="1" value={minutes} disabled={running} aria-label="분" onChange={(event) => configure(event.target.value, seconds)} onBlur={() => setMinutes(String(Math.floor(duration / 60000)).padStart(2, '0'))} /><span>분</span></label><span className="field-separator">:</span><label><input type="number" min="0" max="59" step="1" value={seconds} disabled={running} aria-label="초" onChange={(event) => configure(minutes, event.target.value)} onBlur={() => setSeconds(String(Math.floor(duration / 1000) % 60).padStart(2, '0'))} /><span>초</span></label></div></div>
              <div className="actions">
                <button className="start-button" onClick={toggleTimer} disabled={duration === 0}><Icon name={running ? 'pause' : 'play'} size={16} /><span>{running ? '일시정지' : status === 'paused' ? '이어서 시작' : status === 'finished' ? '다시 시작' : '시작하기'}</span><span className="button-detail" aria-hidden="true">{running ? 'PAUSE' : 'START'}</span></button>
                <button ref={resetButton} className="reset-button" onClick={requestReset} aria-label="타이머 초기화" title="초기화" aria-haspopup={focusMode ? 'dialog' : undefined} aria-expanded={focusMode ? resetPromptOpen : undefined} aria-controls={focusMode && resetPromptOpen ? 'reset-prompt' : undefined}><Icon name="reset" size={20} /></button>
                {resetPromptOpen && <ResetPrompt onContinue={continueTimer} onReset={resetTimer} />}
              </div>
              <p className="timer-message" role="status">{duration === 0 ? '먼저 집중할 시간을 설정해 주세요.' : statusText}</p>
            </div>
            <div className="camp-panel">
              <div className="scene-header"><span><Icon name="leaf" size={12} /> FOREST CAMP</span><span>01 / 01</span></div>
              <div className="scene-frame"><CampScene status={status} rainActive={rainActive} /><button type="button" className="scene-location" onClick={toggleRain} aria-pressed={rainActive} title={rainActive ? '빗소리 끄기' : '빗소리 재생'}><span /> 빗소리</button></div>
              <div className="quest-dialog"><span className="dialog-pointer" aria-hidden="true">▶</span><div><span className="dialog-name">{status === 'finished' ? 'QUEST CLEAR!' : '작은 숲의 탐험가'}</span><p>{status === 'running' ? '좋아, 한 번에 하나씩!\n지금은 집중할 시간이야.' : status === 'paused' ? '숨을 고르는 것도 모험의 일부야.\n준비되면 다시 출발하자.' : status === 'finished' ? '오늘의 작은 모험을 해냈어!\n이제 조금 쉬어도 좋아.' : '서두르지 않아도 괜찮아.\n우리, 작은 집중부터 시작할까?'}</p></div><span className="dialog-next" aria-hidden="true">▼</span></div>
              <div className="camp-caption"><Icon name="heart" size={12} /><span>TAKE YOUR TIME. FIND YOUR TEMPO.</span></div>
            </div>
          </div>
          {focusMode && <ReturnHistory history={returnHistory.history} completedAt={status === 'finished' ? deadline.current : null} />}
          <div className="notification-settings">
            <div className="notification-row">
              <span className="notification-label"><Icon name="bell" size={17} /> 완료 알림</span>
              <div className="notification-controls">
                {notifications.enabled && <button className="notification-test" onClick={notifications.test} disabled={notifications.busy}>테스트</button>}
                <button
                  className="notification-toggle"
                  role="switch"
                  aria-label="완료 알림"
                  aria-checked={notifications.enabled}
                  aria-describedby="notification-help"
                  disabled={!notifications.available || notifications.busy}
                  onClick={notifications.toggle}
                ><span />{notifications.enabled ? '켜짐' : notifications.busy ? '준비 중' : '켜기'}</button>
              </div>
            </div>
            <p id="notification-help" className="notification-help">{notifications.help}</p>
            {notifications.message && <p className="notification-feedback" role="status">{notifications.message}</p>}
          </div>
        </section>

        <div className="gentle-note"><span className="tip-label">TIP!</span><p>모든 모험은 작은 한 걸음에서 시작됩니다.</p><span className="note-spark" aria-hidden="true">✦</span></div>
      </main>

      <footer><span>FORESTTIMER © 2026 <span className="footer-divider">/</span> 작은 집중, 작은 모험</span><span>NO RUSH. JUST YOUR PACE. <Icon name="leaf" size={12} /></span></footer>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
