import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScreenshotManager } from './components/screenshot'
import App from './app'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WindowContextProvider titlebar={{ title: 'athenahq', icon: appIcon, menuItems }}>
        <App />
        <ScreenshotManager
          apiEndpoint="http://localhost:8000"
          pollInterval={30000}
          autoStart={true}
        />
      </WindowContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
