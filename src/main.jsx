import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { durationFromInputs, formatTime, remainingAt, MAX_TIMER_MINUTES } from './timer.js';
import { useNotifications } from './useNotifications.js';
import CampScene from './CampScene.jsx';
import ResetPrompt from './ResetPrompt.jsx';
import SpiritResetDialog from './SpiritResetDialog.jsx';
import ReturnHistory from './ReturnHistory.jsx';
import { useReturnHistory } from './useReturnHistory.js';
import TimePresets from './TimePresets.jsx';
import { DEFAULT_MINUTES } from './presets.js';
import { useTamagotchi } from './useTamagotchi.js';
import { evolutionStage } from './tamagotchi.js';
import { spiritImages } from './tamagotchiAssets.js';
import TamagotchiStatus from './TamagotchiStatus.jsx';
import rainSound from './assets/boons_freak-rain-sound-188158.mp3';
import { SoundController } from './sounds.js';
import { languageFromPath, t } from './i18n.js';
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
    soundOn: ['...#....','..##..#.','.###...#','####.#.#','####.#.#','.###...#','..##..#.','...#....'],
    soundOff: ['...#....','..##....','.###.#.#','####..#.','####.#.#','.###....','..##....','...#....'],
  };
  return <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" {...props}>
    {pixels[name].flatMap((row, y) => [...row].map((pixel, x) => pixel === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null))}
  </svg>;
}

function App() {
  const language = languageFromPath();
  const [duration, setDuration] = useState(DEFAULT_MINUTES * 60 * 1000);
  const [remaining, setRemaining] = useState(duration);
  const [status, setStatus] = useState('idle');
  const [mode, setMode] = useState('normal');
  const [timeEditorOpen, setTimeEditorOpen] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState(String(DEFAULT_MINUTES));
  const [editedSeconds, setEditedSeconds] = useState('00');
  const [resetPromptOpen, setResetPromptOpen] = useState(false);
  const [spiritResetOpen, setSpiritResetOpen] = useState(false);
  const resetButton = useRef(null);
  const deadline = useRef(0);
  const [sound] = useState(() => new SoundController());
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const rainSource = useRef(null);
  const completed = useRef(false);
  const [rainActive, setRainActive] = useState(false);
  const notifications = useNotifications(language, soundEnabled);
  const returnHistory = useReturnHistory();
  const tamagotchi = useTamagotchi();
  const spiritStage = evolutionStage(tamagotchi.profile.totalMilliseconds);
  const spiritImage = spiritImages[tamagotchi.profile.species][spiritStage];
  const spiritName = t(language, tamagotchi.profile.species);
  const notifyCompletion = useRef(notifications.notifyCompletion);
  notifyCompletion.current = notifications.notifyCompletion;
  const running = status === 'running';
  const focusMode = mode === 'focus';
  const progress = duration ? remaining / duration : 0;

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'ko';
  }, [language]);

  function toggleSound() {
    sound.setEnabled(!sound.enabled);
    setSoundEnabled(sound.enabled);
  }

  function stopRain() {
    sound.stopRain();
    rainSource.current = null;
    setRainActive(false);
  }

  function stopResetRain() {
    if (rainSource.current === 'reset') stopRain();
  }

  function startRain(source) {
    if (sound.rainRequested) {
      setRainActive(true);
      return false;
    }
    rainSource.current = source;
    setRainActive(true);
    sound.startRain(rainSound).catch(() => {
      if (!sound.rainRequested) {
        rainSource.current = null;
        setRainActive(false);
      }
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
    tamagotchi.stop();
    returnHistory.stop();
    stopResetRain();
    setRemaining(0);
    setStatus('finished');
    setResetPromptOpen(false);
    playCompletionSound();
    void notifyCompletion.current();
  }

  function playCompletionSound() {
    sound.playCompletion();
  }

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const now = Date.now();
      tamagotchi.tick(now);
      const next = remainingAt(deadline.current, now);
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

  useEffect(() => () => sound.dispose(), [sound]);

  useEffect(() => {
    document.title = status === 'idle' ? 'forestTimer' : `${formatTime(remaining)} · ${status === 'finished' ? t(language, 'statusFinished') : status === 'paused' ? t(language, 'statusPaused') : t(language, 'statusRunning')} — forestTimer`;
  }, [remaining, status]);

  function configure(nextMinutes, nextSeconds) {
    tamagotchi.stop();
    returnHistory.stop();
    stopResetRain();
    setResetPromptOpen(false);
    completed.current = false;
    const nextDuration = durationFromInputs(nextMinutes, nextSeconds);
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setStatus('idle');
  }

  function openTimeEditor() {
    if (running) return;
    setEditedMinutes(String(Math.floor(duration / 60000)));
    setEditedSeconds(String(Math.floor(duration / 1000) % 60).padStart(2, '0'));
    setTimeEditorOpen(true);
  }

  function saveTimeEditor(event) {
    event.preventDefault();
    configure(editedMinutes, editedSeconds);
    setTimeEditorOpen(false);
  }

  function cancelTimeEditor() {
    setTimeEditorOpen(false);
  }

  function toggleTimer() {
    setResetPromptOpen(false);
    if (running) {
      const now = Date.now();
      const next = remainingAt(deadline.current, now);
      if (next === 0) {
        finishTimer();
        return;
      }
      setRemaining(next);
      tamagotchi.stop(now);
      returnHistory.stop();
      stopResetRain();
      setStatus('paused');
      return;
    }
    const next = status === 'finished' ? duration : remaining;
    if (next <= 0) return;
    completed.current = false;
    sound.prepare();
    setRemaining(next);
    const now = Date.now();
    deadline.current = now + next;
    tamagotchi.begin(deadline.current, now);
    if (focusMode) returnHistory.begin(deadline.current, status !== 'paused');
    else returnHistory.stop();
    setStatus('running');
  }

  function resetTimer() {
    tamagotchi.stop();
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

  function requestSpiritReset() {
    setResetPromptOpen(false);
    setSpiritResetOpen(true);
  }

  function confirmSpiritReset() {
    tamagotchi.reset(Date.now());
    setSpiritResetOpen(false);
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

  const statusText = t(language, status === 'idle' ? 'ready' : status);

  return (
    <>
      <div className="app-shell">
      <main>
        <div className="intro">
          <h1>forestTimer</h1>
          <button type="button" className="sound-toggle" role="switch" aria-label={t(language, 'sound')} aria-checked={soundEnabled} title={t(language, soundEnabled ? 'soundDisable' : 'soundEnable')} onClick={toggleSound}>
            <Icon name={soundEnabled ? 'soundOn' : 'soundOff'} size={14} />
            <span>{t(language, 'sound')}</span>
            <span className="sound-toggle-track" aria-hidden="true"><i /></span>
            <span className="sound-toggle-state" aria-hidden="true">{soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <section className={`timer-card is-${status}`} aria-label="forestTimer">
          <div className="card-top">
            <span><Icon name="clock" size={16} /> FOCUS QUEST</span>
            <span className={`status-badge ${running ? 'active' : ''}`}><span />{{ idle: 'READY', running: 'PLAYING', paused: 'PAUSED', finished: 'CLEAR!' }[status]}</span>
            <div className="mode-picker" role="group" aria-label={t(language, 'modePicker')}>
              <button type="button" aria-pressed={mode === 'normal'} onClick={() => selectMode('normal')}>{t(language, 'normal')}</button>
              <button type="button" aria-pressed={focusMode} onClick={() => selectMode('focus')}>{t(language, 'focus')}</button>
            </div>
          </div>
          <div className="game-layout">
            <div className="controls-panel">
              <div className="mission-heading"><span className="mission-number">QUEST 01</span><span>{t(language, 'quest')}</span></div>
              <div className="timer-display">
                <div className="display-top"><span>{status === 'finished' ? t(language, 'questComplete') : t(language, 'timeRemaining')}</span><Icon name={status === 'finished' ? 'star' : 'clock'} size={14} /></div>
                <div className={`time${formatTime(remaining).length > 5 ? ' time-long' : ''}`}>
                  {timeEditorOpen ? (
                    <form className="time-editor" aria-label={t(language, 'timerSettings')} onSubmit={saveTimeEditor} onKeyDown={(event) => { if (event.key === 'Escape') cancelTimeEditor(); }}>
                      <label><span className="sr-only">{t(language, 'minute')}</span><input type="number" min="0" max={MAX_TIMER_MINUTES} step="1" autoFocus value={editedMinutes} onChange={(event) => setEditedMinutes(event.target.value)} /></label>
                      <span aria-hidden="true">:</span>
                      <label><span className="sr-only">{t(language, 'second')}</span><input type="number" min="0" max="59" step="1" value={editedSeconds} onChange={(event) => setEditedSeconds(event.target.value)} /></label>
                      <button type="submit" title={t(language, 'applyTime')} aria-label={t(language, 'applyTime')}>✓</button>
                    </form>
                  ) : running ? (
                    <output className="time-readout" role="timer" aria-label={t(language, 'remainingTime', { time: formatTime(remaining) })} aria-live="off">{formatTime(remaining)}</output>
                  ) : (
                    <button type="button" className="time-edit-trigger" onClick={openTimeEditor} aria-label={t(language, 'editTime', { time: formatTime(remaining) })} title={t(language, 'editTime', { time: formatTime(remaining) })}>{formatTime(remaining)}</button>
                  )}
                </div>
                <div className="progress-hud" aria-hidden="true"><span>TIME</span><div className="progress-segments">{Array.from({ length: 20 }, (_, index) => <i key={index} className={index < Math.ceil(progress * 20) ? 'filled' : ''} />)}</div></div>
                <div className="display-bottom"><span>{status === 'finished' ? t(language, 'wellDone') : t(language, 'oneThing')}</span><span>{Math.ceil(progress * 100)}%</span></div>
              </div>
              <TimePresets language={language} duration={duration} running={running} onSelect={(totalSeconds) => configure(String(Math.floor(totalSeconds / 60)), String(totalSeconds % 60).padStart(2, '0'))} />
              <div className="actions">
                <button className="start-button" onClick={toggleTimer} disabled={duration === 0}><Icon name={running ? 'pause' : 'play'} size={16} /><span>{running ? t(language, 'pause') : status === 'paused' ? t(language, 'resume') : status === 'finished' ? t(language, 'restart') : t(language, 'start')}</span><span className="button-detail" aria-hidden="true">{running ? 'PAUSE' : 'START'}</span></button>
                <button ref={resetButton} className="reset-button" onClick={requestReset} aria-label={t(language, 'reset')} title={t(language, 'reset')} aria-haspopup={focusMode ? 'dialog' : undefined} aria-expanded={focusMode ? resetPromptOpen : undefined} aria-controls={focusMode && resetPromptOpen ? 'reset-prompt' : undefined}><Icon name="reset" size={20} /></button>
                {resetPromptOpen && <ResetPrompt language={language} spiritImage={spiritImage} onContinue={continueTimer} onReset={resetTimer} />}
              </div>
              <p className="timer-message" role="status">{duration === 0 ? t(language, 'setTimeFirst') : statusText}</p>
            </div>
            <div className="camp-panel">
              <div className="scene-header"><span><Icon name="leaf" size={12} /> {t(language, 'camp')}</span><span>{t(language, 'spiritCompanion')}</span></div>
              <div className="scene-frame"><CampScene language={language} status={status} rainActive={rainActive} spiritImage={spiritImage} spiritName={spiritName} spiritStage={spiritStage} plants={tamagotchi.profile.forestPlants} focusMode={focusMode} /><button type="button" className="scene-location" onClick={toggleRain} aria-pressed={rainActive} title={rainActive ? t(language, 'rainOff') : t(language, 'rainOn')}><span /> {t(language, 'rain')}</button></div>
              <div className="quest-dialog"><span className="dialog-pointer" aria-hidden="true">▶</span><div className="quest-dialog-content"><div className="quest-dialog-heading"><span className="dialog-name">{spiritName}</span><button type="button" className="spirit-reset-button" onClick={requestSpiritReset} aria-label={t(language, 'spiritReset')} title={t(language, 'spiritReset')} aria-haspopup="dialog" aria-expanded={spiritResetOpen}><Icon name="reset" size={12} />{t(language, 'reset')}</button></div><p>{t(language, `spirit${status[0].toUpperCase()}${status.slice(1)}`)}</p></div><span className="dialog-next" aria-hidden="true">▼</span></div>
              <TamagotchiStatus language={language} profile={tamagotchi.profile} saved={tamagotchi.saved} />
              <div className="camp-caption"><Icon name="heart" size={12} /><span>TAKE YOUR TIME. FIND YOUR TEMPO.</span></div>
            </div>
          </div>
          {focusMode && <ReturnHistory language={language} history={returnHistory.history} completedAt={status === 'finished' ? deadline.current : null} />}
          <div className="notification-settings">
            <div className="notification-row">
              <span className="notification-label"><Icon name="bell" size={17} /> {t(language, 'notification')}</span>
              <div className="notification-controls">
                {notifications.enabled && <button className="notification-test" onClick={notifications.test} disabled={notifications.busy}>{t(language, 'notificationTest')}</button>}
                <button
                  className="notification-toggle"
                  role="switch"
                  aria-label={t(language, 'notification')}
                  aria-checked={notifications.enabled}
                  aria-describedby="notification-help"
                  disabled={!notifications.available || notifications.busy}
                  onClick={notifications.toggle}
                ><span />{notifications.enabled ? t(language, 'notificationOn') : notifications.busy ? t(language, 'notificationTurningOn') : t(language, 'notificationEnable')}</button>
              </div>
            </div>
            <p id="notification-help" className="notification-help">{notifications.help}</p>
            {notifications.message && <p className="notification-feedback" role="status">{notifications.message}</p>}
          </div>
        </section>

        <div className="gentle-note"><span className="tip-label">TIP!</span><p>{t(language, 'tip')}</p><span className="note-spark" aria-hidden="true">✦</span></div>
      </main>

      <footer><span>FORESTTIMER © 2026 <span className="footer-divider">/</span> {t(language, 'footer')}</span><span>NO RUSH. JUST YOUR PACE. <Icon name="leaf" size={12} /></span></footer>
      </div>
      {spiritResetOpen && <SpiritResetDialog language={language} onCancel={() => setSpiritResetOpen(false)} onConfirm={confirmSpiritReset} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
