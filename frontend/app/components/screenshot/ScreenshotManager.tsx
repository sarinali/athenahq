import React, { useEffect } from 'react'

declare global {
  interface Window {
    conveyor: {
      screenshot: {
        startPolling: (endpoint: string, interval?: number) => Promise<boolean>
        stopPolling: () => Promise<boolean>
        isPolling: () => Promise<boolean>
        captureManual: () => Promise<{
          success: boolean
          message: string
          timestamp: number
          status?: string
          nudge?: string | null
          showOverlay?: boolean
        }>
        setEndpoint: (endpoint: string) => Promise<boolean>
        setInterval: (interval: number) => Promise<boolean>
        setDefaultIntent: (intent: string) => Promise<boolean>
      }
    }
  }
}

interface ScreenshotManagerProps {
  apiEndpoint?: string
  pollInterval?: number
  autoStart?: boolean
}

export const ScreenshotManager: React.FC<ScreenshotManagerProps> = ({
  apiEndpoint = '',
  pollInterval = 30000,
  autoStart = false
}) => {
  useEffect(() => {
    if (autoStart && apiEndpoint && window.conveyor?.screenshot) {
      window.conveyor.screenshot.startPolling(apiEndpoint, pollInterval)
        .catch(console.error)
    }
  }, [apiEndpoint, autoStart, pollInterval])

  return null
}
