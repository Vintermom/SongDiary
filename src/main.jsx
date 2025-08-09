import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

if('serviceWorker'in navigator){window.addEventListener('load',()=>{
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`);
});}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
