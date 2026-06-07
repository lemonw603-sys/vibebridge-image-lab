import 'core-js/actual/array/at'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'streamdown/styles.css'
import './index.css'
import { installMobileViewportGuards } from './lib/viewport'
import { registerAppServiceWorker } from './lib/serviceWorker'

installMobileViewportGuards()

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      registerAppServiceWorker({
        baseUrl: import.meta.env.BASE_URL,
        appVersion: __APP_VERSION__,
      }).catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    })
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister())
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
