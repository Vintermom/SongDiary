import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './theme.css';
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { const swUrl = `${import.meta.env.BASE_URL}service-worker.js`; navigator.serviceWorker.register(swUrl); }); }
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
