import { formatWon, formatDollars } from './percent.js';

const copy = {
  ko: {
    title: '퍼센트 계산기', back: '타이머로 돌아가기', intro: '기준금액에 퍼센트를 더하거나 빼세요.', live: '실시간 계산',
    base: '기준금액', percent: '퍼센트', total: '합계 금액', baseExample: '예: 5000', percentExample: '예: 10 또는 -10',
    percentHelp: '양수는 추가, 음수는 차감해요. 소수도 입력할 수 있으며, 표시 금액의 소수점 이하는 버려요.',
    inputError: '{field}에 숫자를 입력해 주세요. 예: 5000, 10, -10', adjustment: '증감액',
    empty: '기준금액과 퍼센트를 입력하면 합계가 표시돼요.', invalid: '입력한 숫자를 확인해 주세요.', reset: '초기화', footer: '작은 계산, 가벼운 하루',
    simulator: '분할 매수 시뮬레이터', tenSteps: '첫 매수 포함 10회',
    simulatorIntro: '100만원부터 시작해, 직전 매수가에서 설정한 비율만큼 내려갈 때마다 매수금액을 100만원씩 늘려요.',
    perShare: '(1주 가격)', drop: '하락 퍼센트', profit: '이익 퍼센트', priceExample: '예: 100000', dropExample: '예: 7 또는 -7', profitExample: '예: 7',
    dropHelp: '7과 -7 모두 7% 하락으로 계산해요. 기준금액은 0보다 크게, 하락률은 100% 미만으로 입력하세요.',
    profitHelp: '목표 매도가 = 해당 단계의 평단가 × (1 + 이익 퍼센트 ÷ 100)',
    priceError: '기준금액에 0보다 큰 숫자를 입력해 주세요.', dropError: '하락 퍼센트에 100% 미만의 숫자를 입력해 주세요.', profitError: '이익 퍼센트에 -100% 이상의 숫자를 입력해 주세요.',
    summary: '기준 {price} · {drop}% 하락마다 매수 · 목표 이익률 {profit}%', scroll: '표를 좌우로 밀어 전체 내용을 확인하세요.',
    plan: '단계별 매수 계획', caption: '첫 매수를 포함한 총 10회 매수 계획. 매수금액은 회차마다 100만원씩 증가합니다.',
    step: '회차', buyPrice: '매수가 (1주)', investment: '이번 매수금액', cumulative: '누적 투자금', average: '평단가', target: '목표 매도가 (1주)', expected: '예상 이익금', stepNumber: '{step}차', first: '첫 매수',
    planHelp: '누적 투자금은 해당 단계까지만 매수했을 때의 금액이에요. 표시 금액은 소수점 이하를 버려 원 단위로 표시하며, 다음 단계는 소수점을 유지한 가격으로 계산해요.',
    averageHelp: '평단가는 누적 투자금 ÷ 누적 매수수량으로 계산해요. 매수금액 전액을 사용하는 소수점 수량 기준이며, 예상 이익금은 수수료·세금을 제외한 금액이에요. 목표 매도가는 소수점을 유지한 평단가로 계산한 뒤 원 단위로 표시합니다.',
    planEmpty: '기준금액과 하락·이익 퍼센트를 입력하면 10단계 매수 계획이 표시돼요.', planInvalid: '입력값을 확인하면 매수 계획이 표시돼요.',
    save: '저장', cancel: '취소', saveTitle: '시뮬레이터 저장', saveHelp: '현재 기준금액·하락률·이익률을 제목과 함께 저장해요.', name: '제목',
    nameError: '제목을 1~60자로 입력해 주세요.', saveInputError: '계산기 입력값을 확인해 주세요.', saveError: '저장하지 못했어요. 브라우저의 저장 공간 설정을 확인해 주세요.',
    savedTitle: '저장한 시뮬레이터', savedHelp: '제목을 누르면 저장한 설정을 불러와요.', savedValues: '기준 {price} · 하락 {drop}% · 이익 {profit}%',
    loaded: '“{title}” 설정을 불러왔어요.', saved: '“{title}” 저장했어요.',
  },
  en: {
    title: 'Percent Calculator', back: 'Back to timer', intro: 'Add or subtract a percentage from a base amount.', live: 'Live calculation',
    base: 'Base amount (USD)', percent: 'Percent', total: 'Total amount (USD)', baseExample: 'e.g. 5000', percentExample: 'e.g. 10 or -10',
    percentHelp: 'Positive percentages add; negative percentages subtract. Amounts are in US dollars and are displayed to the nearest cent.',
    inputError: 'Enter a number for {field}. Examples: 5000, 10, -10.', adjustment: 'Change',
    empty: 'Enter a base amount and percentage to see the total.', invalid: 'Check the numbers you entered.', reset: 'Reset', footer: 'Small calculations, lighter days',
    simulator: 'Averaging Down Simulator', tenSteps: '10 buys, including the first',
    simulatorIntro: 'Start with $100. Each time the price falls by your chosen percentage from the previous buy price, increase the investment by $100, up to a $1,000 purchase at step 10.',
    perShare: '(per share)', drop: 'Drop percent', profit: 'Profit percent', priceExample: 'e.g. 100', dropExample: 'e.g. 7 or -7', profitExample: 'e.g. 7',
    dropHelp: 'Both 7 and -7 mean a 7% drop. Enter a base price above 0 and a drop below 100%.',
    profitHelp: 'Target sell price = average cost at this step × (1 + profit percent ÷ 100)',
    priceError: 'Enter a base price greater than 0.', dropError: 'Enter a drop percentage below 100%.', profitError: 'Enter a profit percentage of -100% or higher.',
    summary: 'Base {price} · Buy after each {drop}% drop · Target profit {profit}%', scroll: 'Swipe horizontally to view the full table.',
    plan: 'Step-by-step purchase plan', caption: '10 purchases including the initial buy. The investment increases by $100 at each step, from $100 to $1,000.',
    step: 'Step', buyPrice: 'Buy price / share', investment: 'Investment', cumulative: 'Total invested', average: 'Avg. cost / share', target: 'Target sell / share', expected: 'Expected profit', stepNumber: '{step}', first: 'First buy',
    planHelp: 'Total invested includes purchases up to that step. All amounts are in US dollars, rounded to the nearest cent for display. Subsequent prices retain full precision.',
    averageHelp: 'Average cost = total invested ÷ total shares bought. This model uses fractional shares to invest each amount in full. Expected profit excludes fees and taxes. Target sell prices use the unrounded average cost and are displayed to two decimal places.',
    planEmpty: 'Enter the base price, drop percent and profit percent to see the 10-step plan.', planInvalid: 'Check your inputs to see the purchase plan.',
    save: 'Save', cancel: 'Cancel', saveTitle: 'Save simulator', saveHelp: 'Save the current base price, drop percent and profit percent with a title.', name: 'Title',
    nameError: 'Enter a title between 1 and 60 characters.', saveInputError: 'Check the calculator inputs.', saveError: 'Could not save. Check your browser storage settings.',
    savedTitle: 'Saved simulators', savedHelp: 'Select a title to load its saved settings.', savedValues: 'Base {price} · Drop {drop}% · Profit {profit}%',
    loaded: 'Loaded “{title}”.', saved: 'Saved “{title}”.',
  },
};

export function pt(language, key, values = {}) {
  return (copy[language]?.[key] ?? copy.ko[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

export function currencyForLanguage(language) {
  return language === 'en' ? 'USD' : 'KRW';
}

export function moneyLabel(value, language) {
  return language === 'en' ? formatDollars(String(value)) : `${formatWon(String(value))}원`;
}

export function investmentLabel(amount, language) {
  return language === 'en' ? moneyLabel(amount, language) : `${formatWon(String(amount / 10000))}만원`;
}

export function percentTimerHref(pathname, language) {
  return pathname.replace(/\/percent(?:\/us)?(?:\/index\.html)?\/?$/, language === 'en' ? '/us/' : '/');
}
