import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import PercentCalculator from './PercentCalculator.jsx';
import { languageFromPath } from './i18n.js';

createRoot(document.getElementById('root')).render(<PercentCalculator language={languageFromPath()} />);
