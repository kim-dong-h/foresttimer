import React from 'react';

const guides = {
  timer: {
    ko: {
      title: '온라인 타이머 사용 방법',
      intro: 'forestTimer는 분과 초를 직접 설정해 공부, 독서, 작업 시간을 관리하는 온라인 타이머입니다. 설치 없이 브라우저에서 시작하고, 집중하는 동안 숲과 정령을 키울 수 있습니다.',
      stepsTitle: '시간 설정과 타이머 조작',
      steps: ['시간 숫자를 눌러 분·초를 설정하거나 저장한 시간을 선택하세요. 설정 범위는 1초부터 360분까지입니다.', '시작을 누르면 시간이 줄어듭니다. 일시정지 후 이어서 시작할 수 있고, 초기화하면 설정한 시간으로 돌아갑니다.', '빗소리와 완료 알림을 필요에 따라 켜세요. 완료 알림은 지원 브라우저에서 알림 권한을 허용해야 합니다.'],
      featuresTitle: '집중 모드와 숲 성장',
      features: ['집중 모드는 타이머 실행 중 다른 탭이나 앱을 보다가 돌아온 시각을 기록합니다. 실제 집중 여부를 판단하는 기능은 아닙니다.', '일반·집중 모드에서 실제로 수행한 시간을 누적합니다. 정령은 1·3·6시간에 진화하고, 30분마다 숲에 식물이 하나씩 자랍니다.'],
      storage: '정령, 숲, 저장한 시간과 최근 집중 기록은 현재 브라우저에 보관됩니다. 브라우저 데이터를 지우면 사라지고 다른 기기와 공유되지 않습니다. 페이지를 새로고침하면 타이머는 기본 30분으로 돌아옵니다.',
      limit: '완료 알림을 받으려면 타이머 페이지를 열어 두세요. 탭을 닫거나 브라우저가 실행을 중단하면 알림을 예약해서 보낼 수 없습니다.',
      noScript: '타이머를 조작하려면 JavaScript를 켜 주세요. 사용 안내는 JavaScript 없이도 읽을 수 있습니다.',
    },
    en: {
      title: 'An online focus timer that grows a forest',
      intro: 'forestTimer helps you set minutes and seconds for studying, reading and work. Start in your browser without installing an app, and grow a forest and spirit as you spend time with the timer.',
      stepsTitle: 'How to use the timer',
      steps: ['Click the time to set minutes and seconds, or choose a saved duration. Set any duration from one second to 360 minutes.', 'Start the countdown, pause and resume when needed, or reset to the duration you selected.', 'Turn on rain sounds or completion alerts when useful. Alerts require notification permission in a supported browser.'],
      featuresTitle: 'Focus mode and forest growth',
      features: ['Focus mode records when you return from another tab or app during a running timer. These return times do not measure whether you were actually focused.', 'Running time in either mode feeds your spirit. It evolves after one, three and six hours, and a new plant grows every 30 minutes.'],
      storage: 'Your spirit, forest, saved durations and recent focus history stay in this browser. Clearing browser data removes them, and they are not shared across devices. Reloading the page resets the countdown to the default 30 minutes.',
      limit: 'Keep the timer page open for completion alerts. Closing the tab or having the browser suspend it prevents scheduled alerts.',
      noScript: 'Enable JavaScript to use the timer controls. This guide is available without JavaScript.',
    },
  },
  calculator: {
    ko: {
      title: '퍼센트 증가·감소 계산과 분할 매수 시뮬레이터',
      intro: '기준금액에 퍼센트를 더하거나 빼서 증감액과 합계를 계산하세요. 음수와 소수 퍼센트, 쉼표가 들어간 금액을 지원하며 한국어 계산기는 원화 기준으로 표시합니다.',
      stepsTitle: '퍼센트 계산 방법',
      steps: ['기준금액과 퍼센트를 입력하세요. 예를 들어 5,000에 10%를 더하면 5,500이고, -10%를 적용하면 4,500입니다.', '합계는 기준금액 × (1 + 퍼센트 ÷ 100)으로 계산합니다. 표시 금액은 원 단위로 표시하고 내부 계산에서는 소수 정밀도를 유지합니다.', '분할 매수 시뮬레이터에는 별도로 1주 가격, 하락률과 목표 이익률을 입력하세요.'],
      featuresTitle: '시뮬레이터에서 확인할 내용',
      features: ['첫 매수 100만원부터 마지막 매수 1,000만원까지 총 10회, 누적 5,500만원의 계획을 표시합니다. 7과 -7은 모두 7% 하락으로 처리합니다.', '평균 매수가, 목표 매도가와 예상 이익을 계산하며 매수금액 전체를 사용하는 소수점 수량을 가정합니다. 수수료와 세금은 포함하지 않습니다.'],
      storage: '입력한 시뮬레이션을 제목과 함께 현재 브라우저에 저장하고 다시 불러올 수 있습니다. 브라우저 데이터를 삭제하면 저장 목록도 사라집니다.',
      limit: '시뮬레이션은 입력 조건에 따른 수학적 계산이며 실제 거래 결과나 수익을 보장하지 않습니다.',
      noScript: '계산기를 사용하려면 JavaScript를 켜 주세요. 계산 방법은 JavaScript 없이도 읽을 수 있습니다.',
    },
    en: {
      title: 'Percentage increase, decrease and averaging down calculator',
      intro: 'Add or subtract a percentage from a base amount to find the adjustment and total. Negative and decimal percentages are supported. The English calculator uses USD and displays amounts to the nearest cent.',
      stepsTitle: 'How percentage calculations work',
      steps: ['Enter a base amount and a percentage. Applying 10% to 5,000 gives 5,500; applying -10% gives 4,500.', 'The total is base amount × (1 + percentage ÷ 100). Calculations keep decimal precision internally.', 'For the averaging down simulator, enter a separate per-share price, decline percentage and profit target.'],
      featuresTitle: 'Understanding the simulator',
      features: ['The plan starts with $100 and increases to $1,000 over ten purchases, for $5,500 in total. Both 7 and -7 mean a 7% price decline.', 'Review average costs, target sell prices and estimated profits. The calculation assumes fractional shares using each full purchase amount and excludes fees and taxes.'],
      storage: 'Save a simulation with a title and restore its settings in this browser. Clearing browser data removes the saved list.',
      limit: 'These results are mathematical scenarios based on your inputs and do not guarantee trading outcomes or profits.',
      noScript: 'Enable JavaScript to use the calculator. This guide is available without JavaScript.',
    },
  },
};

export default function PageGuide({ kind, language }) {
  const guide = guides[kind][language];
  return <section className="page-guide" aria-labelledby="page-guide-title">
    <h2 id="page-guide-title">{guide.title}</h2>
    <p>{guide.intro}</p>
    <details>
      <summary>{guide.stepsTitle}</summary>
      <ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <h3>{guide.featuresTitle}</h3>
      {guide.features.map(feature => <p key={feature}>{feature}</p>)}
      <p>{guide.storage}</p>
      <p>{guide.limit}</p>
    </details>
    <noscript><p>{guide.noScript}</p></noscript>
  </section>;
}
