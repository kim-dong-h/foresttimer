import React from 'react';
import { longestFocusInterval } from './returnTracking.js';

const clock = new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });
function elapsed(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}

export default function ReturnHistory({ history, completedAt }) {
  const entries = history?.returns ?? [];
  const longest = completedAt ? longestFocusInterval(history, completedAt) : null;
  return (
    <section className="return-history" aria-labelledby="return-history-heading">
      <div className="return-history-header">
        <h2 id="return-history-heading">돌아온 기록</h2>
        <span className="return-count" role="status">총 {entries.length}회</span>
      </div>
      {history && <p className="return-session">시작 · {date.format(history.startedAt)} <time dateTime={new Date(history.startedAt).toISOString()}>{clock.format(history.startedAt)}</time></p>}
      {entries.length ? (
        <div className="return-history-scroll" tabIndex={0} role="region" aria-label="돌아온 시각 목록">
          <table>
            <thead><tr><th scope="col">회차</th><th scope="col">돌아온 시각</th><th scope="col">시작 후 경과</th></tr></thead>
            <tbody>{entries.map((entry, index) => <tr key={`${entry.returnedAt}-${index}`}>
              <td>{index + 1}회</td>
              <td><time dateTime={new Date(entry.returnedAt).toISOString()} title={date.format(entry.returnedAt)}>{clock.format(entry.returnedAt)}</time></td>
              <td>{elapsed(entry.elapsedMs)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="return-empty">{history ? '아직 돌아온 기록이 없어요.' : '타이머를 시작하면 돌아온 시각이 여기에 기록돼요.'}</p>}
      {longest && <div className="focus-summary" role="status">
        <span className="focus-summary-label">최장 집중 구간</span>
        <strong>{elapsed(longest.durationMs)}</strong>
        <p>타이머를 다시 확인하기까지 가장 길게 이어진 시간이에요.</p>
      </div>}
      <p className="return-history-help">실행 중 다른 탭·창으로 갔다 돌아올 때 기록해요. 최근 기록은 이 브라우저에 저장돼요.</p>
    </section>
  );
}
