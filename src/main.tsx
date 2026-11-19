import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/figtree/latin-700.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource-variable/atkinson-hyperlegible-mono';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// An installed app can stay open across a deploy; its old page chunks are then gone from the server.
// Reload once to get the new version instead of showing a blank page (at most every 30 s, so no loop).
window.addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('jy_chunk_reload') || 0);
    if (Date.now() - last < 30_000) return;
    sessionStorage.setItem('jy_chunk_reload', String(Date.now()));
  } catch {
    return; // without storage there is no loop guard, so leave the error to the page
  }
  e.preventDefault();
  window.location.reload();
});

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline support is optional */
      });
    });
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      })
      .catch(() => {
        /* ignore */
      });
  }
}
