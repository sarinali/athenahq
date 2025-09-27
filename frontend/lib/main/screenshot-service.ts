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
  private pollInterval: number = 30000

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow

    mainWindow.on('closed', () => {
      this.cleanup()
    })
  }

  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint
  }

  setPollInterval(interval: number): void {
    this.pollInterval = interval
  }

  async captureScreenshot(): Promise<Buffer | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
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

  private async sendScreenshotToApi(screenshotBuffer: Buffer): Promise<ScreenshotResult> {
    if (!this.apiEndpoint) {
      return {
        success: false,
        message: 'No API endpoint configured',
        timestamp: Date.now()
      }
    }

    try {
      const formData = new FormData()
      const blob = new Blob([new Uint8Array(screenshotBuffer)], { type: 'image/png' })
      formData.append('screenshot', blob, 'screenshot.png')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      let response: Response
      let result: any

      try {
        response = await fetch(this.apiEndpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        })
        clearTimeout(timeoutId)

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

        return {
          success: response.ok,
          message: result.message || `Response: ${response.status}`,
          timestamp: Date.now()
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timed out',
            timestamp: Date.now()
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
        timestamp: Date.now()
      }
    }
  }

  private async performScreenshotCapture(): Promise<ScreenshotResult> {
    const screenshot = await this.captureScreenshot()
    if (!screenshot) {
      return {
        success: false,
        message: 'Failed to capture screenshot',
        timestamp: Date.now()
      }
    }

    return await this.sendScreenshotToApi(screenshot)
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
            timestamp: Date.now()
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