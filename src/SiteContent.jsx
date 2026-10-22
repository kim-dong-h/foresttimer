import React from 'react';
import { SiteLinks, SiteNavigation } from './SiteNavigation.jsx';
import { CONTENT_UPDATED, SITE_EMAIL, SITE_OPERATOR, contentRoutes, siteHref } from './siteRoutes.js';
import { guideArticles } from './guideContent.js';

export function ContentTable({ table }) {
  return <div className="content-table-scroll" role="region" aria-label={table.caption} tabIndex={0}><table className="content-table">
    <caption>{table.caption}</caption>
    <thead><tr>{table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
    <tbody>{table.rows.map((row, index) => <tr key={index}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody>
  </table></div>;
}

function ToolLink({ page, language, pathname }) {
  const names = language === 'en' ? { timer: 'Open focus timer', calculator: 'Open USD calculator', cooking: 'Open cooking timer (Korean)' } : { timer: '집중 타이머 사용하기', calculator: '퍼센트 계산기 사용하기', cooking: '요리 타이머 사용하기' };
  return <a className="content-action" href={siteHref(page, language, pathname)}>{names[page]} →</a>;
}

function GuideCards({ language, pathname }) {
  return <div className="guide-grid">{Object.keys(guideArticles).map(page => {
    const route = contentRoutes.find(route => route.page === page && route.language === language);
    return <div className="guide-card" key={page}><h2><a href={siteHref(page, language, pathname)}>{route.title}</a></h2><p>{route.description}</p><a href={siteHref(page, language, pathname)}>{language === 'en' ? 'Read worked examples' : '예제와 함께 읽기'} →</a></div>;
  })}</div>;
}

function About({ language, pathname }) {
  const en = language === 'en';
  return <>
    <section><h2>{en ? 'Small tools for a task in front of you' : '지금 하는 일에 필요한 작은 도구'}</h2>
      <p>{en ? 'forestTimer provides a focus timer, a cooking timer and a percentage calculator that run in a web browser without an account. The focus timer pairs running time with a forest and a growing spirit so that you can see your accumulated sessions.' : 'forestTimer는 회원가입 없이 브라우저에서 사용하는 집중 타이머, 요리 타이머와 퍼센트 계산기를 제공합니다. 집중 타이머에서는 실제로 수행한 시간을 숲과 정령의 성장으로 확인할 수 있습니다.'}</p>
      <p>{en ? 'Each tool has a specific purpose: timing one task, coordinating several cooking steps or checking a calculation. The guides explain actual controls, worked examples and limitations rather than promising a particular productivity or investment outcome.' : '한 가지 작업의 시간을 재고, 여러 요리의 순서를 맞추고, 계산 과정을 확인하는 것이 각 도구의 역할입니다. 사용 가이드에서는 실제 조작법과 예시, 기능의 한계를 함께 설명합니다.'}</p>
    </section>
    <section><h2>{en ? 'What you can use' : '제공하는 도구'}</h2>
      <ul>
        <li><a href={siteHref('timer', language, pathname)}>{en ? 'Focus timer' : '집중 타이머'}</a>{en ? ': minutes and seconds, saved durations, return history, rain sounds and a growing forest.' : ': 분·초 설정, 자주 쓰는 시간 저장, 돌아온 기록, 빗소리와 숲 성장.'}</li>
        <li><a href={siteHref('cooking', language, pathname)}>{en ? 'Cooking timer (Korean)' : '요리 타이머'}</a>{en ? ': up to six independent timers with names, extra time and completion acknowledgement.' : ': 음식 이름을 붙인 최대 6개의 독립 타이머, 시간 추가와 완료 확인.'}</li>
        <li><a href={siteHref('calculator', language, pathname)}>{en ? 'Percentage calculator' : '퍼센트 계산기'}</a>{en ? ': percentage changes and an averaging down simulator with average costs and profit targets. The English page uses USD; the Korean page uses KRW.' : ': 퍼센트 증가·감소와 평단가·목표 매도가 시뮬레이션. 한국어는 원화, 영어는 달러 기준입니다.'}</li>
      </ul>
    </section>
    <section><h2>{en ? 'Operator and updates' : '운영자와 콘텐츠 관리'}</h2>
      <p>{en ? `This service is operated by ${SITE_OPERATOR}. Tool guides are written around the implemented features and calculation rules. Reports about incorrect results, unclear explanations and browser issues help identify what needs to be corrected.` : `이 서비스의 운영자는 ${SITE_OPERATOR}입니다. 도구 안내는 실제 구현된 기능과 계산 규칙을 기준으로 작성합니다. 잘못된 계산, 이해하기 어려운 설명, 브라우저별 오류 제보를 바탕으로 수정할 부분을 확인합니다.`}</p>
      <p><a href={siteHref('contact', language, pathname)}>{en ? 'Contact the operator or report a correction' : '운영자에게 문의하거나 오류 제보하기'}</a></p>
      <p>{en ? 'Saved tool settings remain in your browser. Analytics and advertising services can separately process usage information. See the privacy policy for details.' : '도구에 저장한 설정은 현재 브라우저에 보관됩니다. 분석·광고 서비스를 통한 이용 정보 처리는 별도로 이루어질 수 있으며 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.'}</p>
      <p><a href={siteHref('privacy', language, pathname)}>{en ? 'Read the privacy policy' : '개인정보처리방침 읽기'}</a></p>
    </section>
  </>;
}

function Contact({ language, pathname }) {
  const en = language === 'en';
  return <>
    <section><h2>{en ? 'Email the operator' : '운영자에게 이메일 보내기'}</h2>
      <p>{en ? `Operator: ${SITE_OPERATOR}` : `운영자: ${SITE_OPERATOR}`}</p>
      <p><a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></p>
      <a className="content-action" href={`mailto:${SITE_EMAIL}?subject=${encodeURIComponent(en ? '[forestTimer] Inquiry' : '[forestTimer] 문의')}`}>{en ? 'Open email app' : '이메일 앱에서 문의 작성'} →</a>
      <p>{en ? 'This link opens your email app. If an app is not configured, copy the address into your preferred email service. The website does not submit a contact form.' : '버튼은 기기의 이메일 앱을 엽니다. 앱이 설정되어 있지 않다면 위 주소를 복사해 사용하는 메일 서비스에서 보내 주세요. 이 사이트에는 문의를 자동 제출하는 폼이 없습니다.'}</p>
    </section>
    <section><h2>{en ? 'Help reproduce an issue' : '오류를 알려주실 때 포함하면 좋은 내용'}</h2>
      <ol>
        <li>{en ? 'The page URL and what you were trying to do.' : '문제가 발생한 페이지 주소와 하려던 작업.'}</li>
        <li>{en ? 'Your browser and device, and the sequence of buttons or inputs.' : '사용한 브라우저·기기와 버튼을 누르거나 값을 입력한 순서.'}</li>
        <li>{en ? 'The result you expected and the result you saw. For calculations, use hypothetical numbers that reproduce the issue.' : '예상한 결과와 실제 결과. 계산 오류는 같은 문제가 나타나는 가상의 숫자로 설명해 주세요.'}</li>
        <li>{en ? 'A screenshot if useful, with personal information removed.' : '필요한 경우 개인정보를 가린 화면 캡처.'}</li>
      </ol>
      <p>{en ? 'Do not send passwords, account numbers or private financial records. Your browser’s saved timer and simulation data are not automatically attached to an email.' : '비밀번호·계좌번호·실제 금융 내역은 보내지 마세요. 브라우저에 저장한 타이머나 시뮬레이션 데이터가 문의 메일에 자동으로 첨부되지는 않습니다.'}</p>
    </section>
    <section><h2>{en ? 'Corrections and privacy requests' : '콘텐츠 수정 및 개인정보 문의'}</h2>
      <p>{en ? 'Use the same email address for a guide correction, accessibility issue, feature suggestion or a request about information you sent to the operator. Include only the details needed to identify and answer your request.' : '사용 가이드의 수정 제안, 접근성 문제, 기능 개선 의견과 운영자에게 보낸 정보의 확인·삭제 요청도 같은 주소로 보내실 수 있습니다. 요청을 확인하고 답변하는 데 필요한 내용만 적어 주세요.'}</p>
      <p><a href={siteHref('privacy', language, pathname)}>{en ? 'How contact emails and site data are handled' : '문의 메일과 사이트 데이터 처리 방식 확인하기'}</a></p>
    </section>
  </>;
}

function Privacy({ language, pathname }) {
  const en = language === 'en';
  return <>
    <section><h2>{en ? '1. Scope and operator' : '1. 적용 범위와 운영자'}</h2>
      <p>{en ? `This policy explains data handling for forest-timer.com. The operator and privacy contact is ${SITE_OPERATOR}, reachable at ${SITE_EMAIL}.` : `이 방침은 forest-timer.com에서 처리되는 정보를 설명합니다. 서비스 운영자 및 개인정보 문의 담당자는 ${SITE_OPERATOR}이며 연락처는 ${SITE_EMAIL}입니다.`}</p>
      <p>{en ? 'There is no account registration. Tool data stored on your device is distinct from usage information processed by analytics, advertising and hosting services.' : '서비스는 회원가입을 받지 않습니다. 기기에 저장되는 도구 데이터와 분석·광고·호스팅 서비스를 통해 처리되는 이용 정보는 구분됩니다.'}</p>
    </section>
    <section><h2>{en ? '2. Data stored in your browser' : '2. 브라우저에 저장되는 정보'}</h2>
      <ContentTable table={en ? { caption: 'Local tool data', headers: ['Data', 'Purpose and duration'], rows: [['Spirit, plants, accumulated and daily running time', 'Restore growth and daily progress; updated as the timer runs.'], ['Saved durations, recent return history and sound setting', 'Restore your preferences and recent session information.'], ['Simulation titles, input values and currency', 'Restore saved scenarios separately for USD and KRW.'], ['Cooking card names, durations, status and end times', 'Restore cards and recalculate remaining time after reload.']] } : { caption: '기기 내 도구 데이터', headers: ['정보', '사용 목적과 보관 방식'], rows: [['정령·식물·누적 및 오늘 수행 시간', '성장과 오늘 기록 복원. 타이머 사용에 따라 갱신됩니다.'], ['저장한 시간·최근 돌아온 기록·소리 설정', '선택한 설정과 최근 세션 정보 복원.'], ['시뮬레이션 제목·입력값·통화', '원화·달러별 계산 조건 복원.'], ['요리 카드 이름·시간·상태·종료 시각', '카드 복원과 새로고침 후 남은 시간 계산.']] }} />
      <p>{en ? 'These values use localStorage on the current browser and are not automatically synchronized to an operator database or another device. They remain until cleared, replaced by newer state or removed by the browser. Site-data controls in your browser can erase them; spirit reset and cooking-card deletion affect their respective records.' : '이 값들은 현재 브라우저의 localStorage를 사용하며 운영자의 데이터베이스나 다른 기기로 자동 동기화되지 않습니다. 직접 삭제하거나 새 상태로 갱신하거나 브라우저가 제거할 때까지 남을 수 있습니다. 브라우저의 사이트 데이터 삭제로 지울 수 있고, 정령 초기화와 요리 카드 삭제는 각각의 기록에 적용됩니다.'}</p>
      <p>{en ? 'The calculator does not implement a separate analytics event that sends your entered amounts or saved titles. This local storage description does not mean that no information is processed by the external services described below.' : '계산기는 입력 금액이나 저장 제목을 별도 분석 이벤트로 전송하도록 구현되어 있지 않습니다. 브라우저 저장 방식에 대한 설명이 아래 외부 서비스의 정보 처리까지 없다는 뜻은 아닙니다.'}</p>
    </section>
    <section><h2>{en ? '3. Google Analytics and advertising' : '3. Google Analytics 및 광고 서비스'}</h2>
      <p>{en ? 'The site includes Google Analytics for usage statistics and Google AdSense code for advertising. Google and other advertising providers may use cookies or similar identifiers and process page URLs, network and device information, and interactions for measurement, service delivery and advertising.' : '사이트에는 이용 통계를 위한 Google Analytics와 광고 서비스를 위한 Google AdSense 코드가 포함되어 있습니다. Google 및 광고 제공업체는 쿠키나 유사 식별자를 사용하고 페이지 주소, 네트워크·기기 정보와 이용 정보를 측정·서비스 제공·광고 목적으로 처리할 수 있습니다.'}</p>
      <p>{en ? 'Depending on consent and advertising settings, Google and its partners may personalize ads using visits to this and other websites. Data handling and retention by these providers follow their policies and the applicable service settings. Their systems may process data outside your country.' : '동의 및 광고 설정에 따라 Google과 파트너는 이 사이트 및 다른 사이트의 방문 기록을 활용해 개인 맞춤 광고를 제공할 수 있습니다. 제공업체의 정보 처리와 보관에는 각 업체의 정책 및 서비스 설정이 적용되며 국외 인프라에서 처리될 수 있습니다.'}</p>
      <ul>
        <li><a href={`https://policies.google.com/technologies/partner-sites?hl=${en ? 'en' : 'ko'}`}>{en ? 'How Google uses information from partner sites' : 'Google이 파트너 사이트의 정보를 사용하는 방법'}</a></li>
        <li><a href={`https://policies.google.com/privacy?hl=${en ? 'en' : 'ko'}`}>{en ? 'Google Privacy Policy' : 'Google 개인정보처리방침'}</a></li>
        <li><a href="https://myadcenter.google.com/">{en ? 'Manage personalized advertising in My Ad Center' : '내 광고 센터에서 개인 맞춤 광고 설정 관리'}</a></li>
        <li><a href="https://optout.aboutads.info/">{en ? 'Participating third-party advertising opt-out options' : '참여하는 제3자 광고업체의 맞춤 광고 거부 설정'}</a></li>
      </ul>
    </section>
    <section><h2>{en ? '4. Hosting and contact emails' : '4. 호스팅 및 문의 메일'}</h2>
      <p>{en ? 'Cloudflare delivers and protects the website. Connection information such as IP addresses and request metadata may be processed to deliver pages and protect the service. See Cloudflare’s privacy policy for its processing and retention practices.' : '웹사이트 전달과 보호에는 Cloudflare를 사용합니다. 페이지 전달과 서비스 보호를 위해 IP 주소와 요청 관련 정보 등 연결 정보가 처리될 수 있습니다. Cloudflare의 처리·보관 방식은 해당 업체의 개인정보처리방침을 참고해 주세요.'} <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</a></p>
      <p>{en ? 'If you email the operator, your email address, message and any attachments are received through Gmail and used to answer and resolve the request. Provide only necessary information. Contact messages are deleted when the matter is resolved and further follow-up is no longer needed, except where retention is required by law.' : '운영자에게 이메일을 보내면 발신 주소, 문의 내용과 첨부파일이 Gmail을 통해 전달되며 답변과 문제 해결에 사용됩니다. 필요한 정보만 보내 주세요. 문의가 해결되고 추가 확인이 필요하지 않으면 메일을 삭제하며, 법령에 따라 보관이 필요한 경우는 해당 의무를 따릅니다.'}</p>
    </section>
    <section><h2>{en ? '5. Your choices and requests' : '5. 이용자의 선택과 요청'}</h2>
      <p>{en ? 'You can clear this site’s browser data, restrict cookies and change notification permission in your browser settings. Clearing local data removes saved progress and scenarios. Restricting storage may prevent settings from being restored. Google also provides the Analytics opt-out browser add-on below.' : '브라우저 설정에서 이 사이트의 데이터 삭제, 쿠키 제한, 알림 권한 변경을 할 수 있습니다. 데이터를 삭제하면 저장한 성장 기록과 계산 조건이 사라지며 저장소를 제한하면 설정 복원이 안 될 수 있습니다. Google은 아래 Analytics 수신 거부 브라우저 부가 기능도 제공합니다.'}</p>
      <p><a href="https://tools.google.com/dlpage/gaoptout">{en ? 'Google Analytics opt-out browser add-on' : 'Google Analytics 수신 거부 브라우저 부가 기능'}</a></p>
      <p>{en ? 'For access, correction or deletion of information you sent to the operator, contact the address on our contact page. The operator cannot remotely restore or delete local-only browser records; use the site-data settings on the device that holds them.' : '운영자에게 보낸 정보의 확인·정정·삭제는 문의 페이지의 주소로 요청할 수 있습니다. 브라우저에만 보관된 기록은 운영자가 원격으로 복원하거나 삭제할 수 없으므로 해당 기기의 사이트 데이터 설정을 이용해 주세요.'} <a href={siteHref('contact', language, pathname)}>{en ? 'Contact' : '문의하기'}</a></p>
    </section>
    <section><h2>{en ? '6. Changes to this policy' : '6. 방침 변경'}</h2><p>{en ? 'When data handling or services change, this page will be updated with the revised text and date. Important changes will be described on the site.' : '데이터 처리 방식이나 서비스가 달라지면 이 페이지의 내용과 수정일을 갱신합니다. 중요한 변경은 사이트에서 안내합니다.'}</p></section>
  </>;
}

export default function SiteContent({ page, language = 'ko', pathname = globalThis.location?.pathname ?? '/' }) {
  const route = contentRoutes.find(route => route.page === page && route.language === language);
  const article = guideArticles[page];
  const en = language === 'en';
  const current = article ? 'guides' : page;
  return <div className="content-shell">
    <SiteNavigation language={language} current={current} pathname={pathname} />
    <main className="content-main">
      <header className="content-heading">
        <p className="content-eyebrow">FOREST TIMER / {article || page === 'guides' ? 'FIELD GUIDE' : 'SITE INFORMATION'}</p>
        <a className="content-language" href={siteHref(page, en ? 'ko' : 'en', pathname)} hrefLang={en ? 'ko' : 'en'}>{en ? '한국어' : 'English'} →</a>
        <h1>{route.title}</h1><p className="content-intro">{route.description}</p>
        <p className="content-meta"><span>{en ? 'Written and maintained by' : '작성·관리'} {SITE_OPERATOR}</span><span>{en ? 'Updated' : '최종 수정'} <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time></span></p>
      </header>
      <article className="content-article" aria-label={route.title}>
        {page === 'about' && <About language={language} pathname={pathname} />}
        {page === 'contact' && <Contact language={language} pathname={pathname} />}
        {page === 'privacy' && <Privacy language={language} pathname={pathname} />}
        {page === 'guides' && <><p>{en ? 'Choose the task you want to understand. Each guide connects a worked example to the actual controls, explains how data is saved, and describes where the tool’s results or alerts have limits.' : '알아보고 싶은 작업을 선택하세요. 각 가이드에서 실제 조작법과 계산·시간 설정 예제, 저장 방식 및 결과·알림의 한계를 함께 확인할 수 있습니다.'}</p><GuideCards language={language} pathname={pathname} /></>}
        {article && <>
          <ToolLink page={article.tool} language={language} pathname={pathname} />
          <nav aria-label={en ? 'On this page' : '이 가이드의 목차'}><ul className="content-toc">{article[language].map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
          {article[language].map(section => <section id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.table && <ContentTable table={section.table} />}
            {section.steps && <ol>{section.steps.map(step => <li key={step}>{step}</li>)}</ol>}
            {section.note && <aside className="content-callout">{section.note}</aside>}
          </section>)}
          <section><h2>{en ? 'Try the example in the tool' : '도구에서 직접 확인하기'}</h2><ToolLink page={article.tool} language={language} pathname={pathname} /><p><a href={siteHref('guides', language, pathname)}>{en ? 'Browse the other guides' : '다른 사용 가이드 보기'} →</a></p></section>
        </>}
      </article>
    </main>
    <footer><span>FORESTTIMER © 2026</span></footer>
    <SiteLinks language={language} current={current} pathname={pathname} />
  </div>;
}
