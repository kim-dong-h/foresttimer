import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';
import PercentCalculator from './PercentCalculator.jsx';
import CookingTimer from './CookingTimer.jsx';
import SiteContent from './SiteContent.jsx';
import { contentRouteAt } from './siteRoutes.js';

export function renderPage(kind, language, pathname) {
  if (kind === 'content') return renderToString(<SiteContent page={contentRouteAt(pathname).page} language={language} pathname={pathname} />);
  return renderToString(kind === 'timer'
    ? <App language={language} pathname={pathname} />
    : kind === 'cooking' ? <CookingTimer /> : <PercentCalculator language={language} />);
}
