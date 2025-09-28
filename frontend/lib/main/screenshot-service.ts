import { BrowserWindow, desktopCapturer } from 'electron'
import { getOverlayService } from './overlay-service'

export interface ScreenshotResult {
  success: boolean
  message: string
  timestamp: number
}

export class ScreenshotService {
  private pollingInterval: NodeJS.Timeout | null = null
  private mainWindow: BrowserWindow | null = null
  private apiEndpoint: string = ''
  private pollInterval: number = 10000
  private isRequestInProgress: boolean = false

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow

    mainWindow.on('closed', () => {
      this.cleanup()
    })
  }

  setApiEndpoint(endpoint: string): void {
    console.log('[ScreenshotService] Setting API endpoint:', endpoint)
    this.apiEndpoint = endpoint
  }

  setPollInterval(interval: number): void {
    this.pollInterval = interval
  }

  async captureScreenshot(): Promise<Buffer | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 },
      })

      if (sources.length === 0) {
        return null
      }

      const primaryScreen = sources[0]
      const pngBuffer = primaryScreen.thumbnail.toPNG()
      return pngBuffer
    } catch (error) {
      return null
    }
  }

  async captureScreenshotWithIntent(intent: string): Promise<ScreenshotResult> {
    try {
      console.log('[ScreenshotService] Capturing screenshot with intent:', intent)
      const screenshotBuffer = await this.captureScreenshot()
      if (!screenshotBuffer) {
        console.log('[ScreenshotService] Screenshot buffer is null/undefined')
        return {
          success: false,
          message: 'Failed to capture screenshot',
          timestamp: Date.now(),
        }
      }

      console.log('[ScreenshotService] Screenshot buffer size:', screenshotBuffer.length, 'bytes')
      return await this.sendScreenshotToApi(screenshotBuffer, intent)
    } catch (error) {
      console.error('[ScreenshotService] Error in captureScreenshotWithIntent:', error)
      return {
        success: false,
        message: `Screenshot capture failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  async sendStringToBackend(message: string): Promise<ScreenshotResult> {
    if (!this.apiEndpoint) {
      return {
        success: false,
        message: 'No API endpoint configured',
        timestamp: Date.now(),
      }
    }

    try {
      console.log('[ScreenshotService] Sending string to backend:', message)

      const requestPayload = {
        message: message,
      }

      const response = await fetch(`${this.apiEndpoint}/core/echo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          message: `Backend received: ${result.message || message}`,
          timestamp: Date.now(),
        }
      } else {
        return {
          success: false,
          message: `Backend error: ${response.status}`,
          timestamp: Date.now(),
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error}`,
        timestamp: Date.now(),
      }
    }
  }

  private async sendScreenshotToApi(screenshotBuffer: Buffer, intent?: string): Promise<ScreenshotResult> {
    if (!this.apiEndpoint) {
      return {
        success: false,
        message: 'No API endpoint configured',
        timestamp: Date.now(),
      }
    }

    try {
      const base64Screenshot = screenshotBuffer.toString('base64')
      console.log('[ScreenshotService] Base64 screenshot length:', base64Screenshot.length)
      console.log('[ScreenshotService] Base64 screenshot preview:', base64Screenshot.substring(0, 50) + '...')

      const requestPayload = {
        intent: intent || 'Finish athenahq prototype',
        image_base64: base64Screenshot,
      }

      let response: Response
      let result: any

      try {
        const trackTaskUrl = `${this.apiEndpoint}/core/track-task`
        console.log('[ScreenshotService] Making request to:', trackTaskUrl)
        console.log('[ScreenshotService] Request payload size:', JSON.stringify(requestPayload).length, 'bytes')
        console.log('[ScreenshotService] Base64 image size:', base64Screenshot.length, 'characters')

        const startTime = Date.now()
        response = await fetch(trackTaskUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(requestPayload),
        })

        const requestTime = Date.now() - startTime
        console.log('[ScreenshotService] Request completed in:', requestTime, 'ms')

        try {
          const responseText = await response.text()

          if (responseText.trim()) {
            result = JSON.parse(responseText)
          } else {
            result = { message: 'Empty response' }
          }
        } catch (jsonError) {
          result = { message: 'Invalid JSON response' }
        }

        if (response.ok && result.status) {
          const confidence = Math.round((result.confidence || 0) * 100)
          return {
            success: true,
            message: `Status: ${result.status} (${confidence}% confidence) - ${result.reasoning || 'No reasoning provided'}`,
            timestamp: Date.now(),
          }
        } else {
          return {
            success: false,
            message: result.detail || result.message || `HTTP ${response.status}`,
            timestamp: Date.now(),
          }
        }
      } catch (fetchError) {
        console.error('[ScreenshotService] Fetch error:', fetchError)

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('[ScreenshotService] Request aborted due to timeout after 30 seconds')
          return {
            success: false,
            message: 'Task analysis timed out',
            timestamp: Date.now(),
          }
        }

        if (fetchError instanceof TypeError) {
          console.error('[ScreenshotService] Network error - backend may not be running:', fetchError.message)
          return {
            success: false,
            message: `Network error: ${fetchError.message}`,
            timestamp: Date.now(),
          }
        }

        throw fetchError
      }
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof TypeError) {
        errorMessage = `Network error: ${error.message}`
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      return {
        success: false,
        message: errorMessage,
        timestamp: Date.now(),
      }
    }
  }

  private async performScreenshotCapture(): Promise<ScreenshotResult> {
    if (this.isRequestInProgress) {
      return {
        success: false,
        message: 'Request already in progress, skipping',
        timestamp: Date.now(),
      }
    }

    this.isRequestInProgress = true

    try {
      const screenshot = await this.captureScreenshot()
      if (!screenshot) {
        return {
          success: false,
          message: 'Failed to capture screenshot',
          timestamp: Date.now(),
        }
      }
      const res = await this.sendScreenshotToApi(screenshot)
      console.log('res', res)
      return res
    } finally {
      this.isRequestInProgress = false
    }
  }

  startPolling(): void {
    if (this.pollingInterval) {
      this.stopPolling()
    }

    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) {
          this.stopPolling()
          return
        }

        let result: ScreenshotResult
        try {
          result = await this.performScreenshotCapture()
        } catch (captureError) {
          result = {
            success: false,
            message: captureError instanceof Error ? captureError.message : 'Screenshot capture failed',
            timestamp: Date.now(),
          }
        }

        try {
          const overlayService = getOverlayService()
          if (overlayService) {
            if (result.success) {
              overlayService.showToast(`Screenshot sent: ${result.message}`, 'success')
            } else {
              overlayService.showToast(`Screenshot failed: ${result.message}`, 'error')
            }
          }
        } catch (overlayError) {
          console.error('[ScreenshotService] Error interacting with overlay service:', overlayError)
        }
      } catch (error) {
        console.error('[ScreenshotService] Critical error in screenshot polling loop:', error)
      }
    }, this.pollInterval)
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  isPolling(): boolean {
    return this.pollingInterval !== null
  }

  async captureManualScreenshot(): Promise<ScreenshotResult> {
    return await this.performScreenshotCapture()
  }

  cleanup(): void {
    this.stopPolling()
    this.mainWindow = null
  }
}

let screenshotService: ScreenshotService | null = null

export const createScreenshotService = (mainWindow: BrowserWindow): ScreenshotService => {
  screenshotService = new ScreenshotService(mainWindow)
  return screenshotService
}

export const getScreenshotService = (): ScreenshotService | null => {
  return screenshotService
}
