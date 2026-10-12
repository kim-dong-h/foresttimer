import React from 'react';
import { t } from './i18n.js';

export default function BrowserStorageNotice({ language = 'ko' }) {
  return <p className="browser-storage-notice">{t(language, 'browserStorageNotice')}</p>;
}
