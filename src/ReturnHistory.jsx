import React from 'react';
import { longestFocusInterval } from './returnTracking.js';
import { formatElapsed, t } from './i18n.js';

export default function ReturnHistory({ history, completedAt, language }) {
  const locale = language === 'en' ? 'en-US' : 'ko-KR';
  const clock = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const date = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' });
  const entries = history?.returns ?? [];
  const longest = completedAt ? longestFocusInterval(history, completedAt) : null;
  return (
    <section className="return-history" aria-labelledby="return-history-heading">
      <div className="return-history-header">
        <h2 id="return-history-heading">{t(language, 'returnHistory')}</h2>
        <span className="return-count" role="status">{t(language, 'totalCount', { count: entries.length })}</span>
      </div>
      {history && <p className="return-session">{t(language, 'started')} · {date.format(history.startedAt)} <time dateTime={new Date(history.startedAt).toISOString()}>{clock.format(history.startedAt)}</time></p>}
      {entries.length ? (
        <div className="return-history-scroll" tabIndex={0} role="region" aria-label={t(language, 'returnTimes')}>
          <table>
            <thead><tr><th scope="col">#</th><th scope="col">{t(language, 'returnedAt')}</th><th scope="col">{t(language, 'elapsed')}</th></tr></thead>
            <tbody>{entries.map((entry, index) => <tr key={`${entry.returnedAt}-${index}`}>
              <td>{t(language, 'round', { count: index + 1 })}</td>
              <td><time dateTime={new Date(entry.returnedAt).toISOString()} title={date.format(entry.returnedAt)}>{clock.format(entry.returnedAt)}</time></td>
              <td>{formatElapsed(entry.elapsedMs, language)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="return-empty">{history ? t(language, 'noReturns') : t(language, 'startToRecord')}</p>}
      {longest && <div className="focus-summary" role="status">
        <span className="focus-summary-label">{t(language, 'longestFocus')}</span>
        <strong>{formatElapsed(longest.durationMs, language)}</strong>
        <p>{t(language, 'longestHelp')}</p>
      </div>}
      <p className="return-history-help">{t(language, 'returnHelp')}</p>
    </section>
  );
}
