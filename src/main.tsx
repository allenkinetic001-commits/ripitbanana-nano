import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ChallengeProvider } from './contexts/ChallengeContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChallengeProvider>
      <App />
    </ChallengeProvider>
  </StrictMode>,
)
