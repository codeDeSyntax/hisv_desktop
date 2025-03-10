import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BmusicProvider } from './Provider/Bmusic'
import { SermonProvider } from './Provider/Vsermons'
import { EastVoiceProvider } from './Provider/EastVoice'


import './index.css'

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
  <EastVoiceProvider>
  <BmusicProvider>
      <SermonProvider>
        <App />
      </SermonProvider>
    </BmusicProvider>
  </EastVoiceProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
