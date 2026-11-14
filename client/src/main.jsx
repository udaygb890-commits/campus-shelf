import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Route OAuth callbacks arriving on pathname into HashRouter
if (window.location.pathname.endsWith('/auth/callback')) {
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  const basePath = window.location.pathname.replace(/\/auth\/callback$/, '') || '/';
  window.history.replaceState(null, '', `${basePath}#/auth/callback${search}${hash}`);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

