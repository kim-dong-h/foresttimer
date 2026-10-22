export const SITE_ORIGIN = 'https://forest-timer.com';
export const SITE_OPERATOR = '김동혁';
export const SITE_EMAIL = 'comhyuck@gmail.com';
export const CONTENT_UPDATED = '2026-10-22';

export const contentDefinitions = [
  ['about', 'about', ['forestTimer 소개', 'About forestTimer'], ['서비스의 목적, 제공 도구와 운영자를 소개합니다.', 'Learn about our tools, their purpose and the person operating forestTimer.']],
  ['contact', 'contact', ['문의 및 오류 제보', 'Contact and report an issue'], ['사용 중 발견한 오류, 계산 결과와 개인정보 관련 문의를 보내는 방법입니다.', 'How to report a timer or calculator issue, suggest an improvement or contact the operator about privacy.']],
  ['privacy', 'privacy', ['개인정보처리방침', 'Privacy policy'], ['브라우저 저장소, Google 분석·광고 서비스, 문의 이메일의 데이터 처리 방식을 안내합니다.', 'How browser storage, Google analytics and advertising services, and contact emails are handled.']],
  ['guides', 'guides', ['forestTimer 사용 가이드', 'forestTimer guides'], ['집중 타이머, 퍼센트 계산기와 요리 타이머를 실제 예제로 이해하세요.', 'Practical examples for the focus timer, percentage calculator and cooking timer.']],
  ['focusGuide', 'guides/focus-timer', ['집중 시간을 설계하고 숲을 키우는 방법', 'Plan a focus session and grow your forest'], ['공부·독서·작업별 시간 설정 예제와 집중 기록, 정령 진화, 저장·알림의 한계를 설명합니다.', 'Study, reading and work examples, return history, spirit evolution, and storage and alert limitations.']],
  ['percentGuide', 'guides/percent-calculator', ['퍼센트와 평단가 계산을 예제로 이해하기', 'Understand percentages and average cost by example'], ['할인·인상·연속 퍼센트와 분할 매수 평단가·목표 매도가 계산 과정을 설명합니다.', 'Worked examples of discounts, increases, successive percentages, average cost and target sell prices.']],
  ['cookingGuide', 'guides/cooking-timer', ['여러 요리의 타이머를 함께 사용하는 방법', 'Coordinate several cooking timers'], ['파스타와 소스 타이밍 예제로 독립 타이머, 시간 추가, 완료 확인과 복원을 설명합니다.', 'A pasta and sauce timing example explains independent timers, extra time, completion alerts and restoration.']],
];

export const contentRoutes = contentDefinitions.flatMap(([page, slug, titles, descriptions]) => ['ko', 'en'].map((language, index) => ({
  page, language, path: `/${slug}/${language === 'en' ? 'us/' : ''}`, title: titles[index], description: descriptions[index],
})));

export function sitePath(page, language = 'ko') {
  if (page === 'timer') return language === 'en' ? '/us/' : '/';
  if (page === 'calculator') return language === 'en' ? '/percent/us/' : '/percent/';
  if (page === 'cooking') return '/cooking/';
  const route = contentRoutes.find(route => route.page === page && route.language === language);
  if (!route) throw new Error(`Unknown site page: ${page}/${language}`);
  return route.path;
}

const knownPaths = [...contentRoutes.map(route => route.path), '/percent/us/', '/percent/', '/cooking/', '/kr/', '/us/'].sort((a, b) => b.length - a.length);
export function normalizedPath(pathname) {
  return pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
}

export function siteHref(page, language = 'ko', pathname = globalThis.location?.pathname ?? '/') {
  const current = normalizedPath(pathname);
  const suffix = knownPaths.find(path => current.endsWith(path));
  const depth = suffix ? suffix.split('/').filter(Boolean).length : 0;
  return `${depth ? '../'.repeat(depth) : './'}${sitePath(page, language).slice(1)}`;
}

export function contentRouteAt(pathname) {
  const current = normalizedPath(pathname);
  return [...contentRoutes].sort((a, b) => b.path.length - a.path.length).find(route => current.endsWith(route.path));
}
