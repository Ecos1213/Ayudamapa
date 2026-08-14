import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import './i18n'
import App from './App.jsx'
import { queryClient } from './utils/queryClient.js'
import i18next from './i18n/index.js'
import { registerServiceWorker } from './utils/serviceWorkerManager.js'
import { initializeDB } from './services/indexeddb.js'

// Initialize IndexedDB and register Service Worker
Promise.all([
  initializeDB().catch((e) => console.warn('IndexedDB init failed:', e)),
  registerServiceWorker().catch((e) => console.warn('SW registration failed:', e)),
]).then(() => {
  console.log('App initialized');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <App />
      </I18nextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
