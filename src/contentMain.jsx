import React from 'react';
import { createRoot } from 'react-dom/client';
import SiteContent from './SiteContent.jsx';
import { contentRouteAt } from './siteRoutes.js';
import './styles.css';

const pathname = window.location.pathname;
const route = contentRouteAt(pathname);
if (route) createRoot(document.getElementById('root')).render(<SiteContent page={route.page} language={route.language} pathname={pathname} />);
