import React from 'react';
import { createRoot } from 'react-dom/client';
import CookingTimer from './CookingTimer.jsx';
import './styles.css';
import './cooking.css';

if (/\/cooking$/.test(window.location.pathname)) {
  window.location.replace(`${window.location.pathname}/${window.location.search}${window.location.hash}`);
} else {
  createRoot(document.getElementById('root')).render(<CookingTimer />);
}
