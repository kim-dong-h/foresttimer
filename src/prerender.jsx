import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';
import PercentCalculator from './PercentCalculator.jsx';
import CookingTimer from './CookingTimer.jsx';

export function renderPage(kind, language, pathname) {
  return renderToString(kind === 'timer'
    ? <App language={language} pathname={pathname} />
    : kind === 'cooking' ? <CookingTimer /> : <PercentCalculator language={language} />);
}
