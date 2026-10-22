import React, { memo } from 'react';
import { siteHref } from './siteRoutes.js';
import './site.css';

const labels = {
  ko: { timer: '집중 타이머', cooking: '요리 타이머', calculator: '퍼센트 계산기', guides: '사용 가이드', about: '서비스 소개', contact: '문의', privacy: '개인정보처리방침' },
  en: { timer: 'Focus timer', cooking: 'Cooking timer (KO)', calculator: 'Calculator', guides: 'Guides', about: 'About', contact: 'Contact', privacy: 'Privacy' },
};

export const SiteNavigation = memo(function SiteNavigation({ language = 'ko', current, pathname }) {
  return <nav className="site-navigation" aria-label={language === 'en' ? 'Main navigation' : '주 메뉴'}>
    {['timer', 'cooking', 'calculator'].map(page => <a key={page} href={siteHref(page, language, pathname)} aria-current={current === page ? 'page' : undefined}>{labels[language][page]}</a>)}
  </nav>;
});

export const SiteLinks = memo(function SiteLinks({ language = 'ko', current, pathname }) {
  return <nav className="site-links" aria-label={language === 'en' ? 'Site information' : '사이트 정보'}>
    {['about', 'contact', 'privacy', 'guides'].map(page => <a key={page} href={siteHref(page, language, pathname)} aria-current={current === page ? 'page' : undefined}>{labels[language][page]}</a>)}
  </nav>;
});
