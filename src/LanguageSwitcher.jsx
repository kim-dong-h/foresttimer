import React from 'react';
import { publicAssetPath, t } from './i18n.js';

export default function LanguageSwitcher({ language, pathname, timerActive }) {
  return (
    <nav className="language-switcher" aria-label={t(language, 'languageSelection')}>
      {[['ko', 'kr/', '한국어', 'KO'], ['en', 'us/', 'English', 'EN']].map(([locale, path, name, code], index) => (
        <React.Fragment key={locale}>
          {index > 0 && <span className="language-divider" aria-hidden="true">/</span>}
          <a href={publicAssetPath(path, pathname)} hrefLang={locale} lang={locale}
            aria-label={name} aria-current={language === locale ? 'page' : undefined}
            aria-disabled={timerActive && language !== locale ? true : undefined}
            title={timerActive && language !== locale ? t(language, 'languageTimerActive') : name}
            onClick={(event) => { if (timerActive || language === locale) event.preventDefault(); }}>
            <span className="language-name">{name}</span><span className="language-code" aria-hidden="true">{code}</span>
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
}
