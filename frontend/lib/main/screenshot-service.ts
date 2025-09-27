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
      return primaryScreen.thumbnail.toPNG()
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    }
  }

  private isAthenaWindowActive(): boolean {
    if (!this.mainWindow) return false
    return this.mainWindow.isFocused()
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
      const blob = new Blob([screenshotBuffer], { type: 'image/png' })
      formData.append('screenshot', blob, 'screenshot.png')

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      return {
        success: response.ok,
        message: result.message || `Response: ${response.status}`,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  private async performScreenshotCapture(): Promise<ScreenshotResult> {
    if (this.isAthenaWindowActive()) {
      return {
        success: true,
        message: 'Skipped - Athena window is active',
        timestamp: Date.now()
      }
    }

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
      const result = await this.performScreenshotCapture()
      const overlayService = getOverlayService()

      if (result.message === 'Skipped - Athena window is active') {
        return
      }

      if (overlayService) {
        if (result.success) {
          overlayService.showToast(`Screenshot sent: ${result.message}`, 'success')
        } else {
          overlayService.showToast(`Screenshot failed: ${result.message}`, 'error')
        }
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
}

let screenshotService: ScreenshotService | null = null

export const createScreenshotService = (mainWindow: BrowserWindow): ScreenshotService => {
  screenshotService = new ScreenshotService(mainWindow)
  return screenshotService
}

export const getScreenshotService = (): ScreenshotService | null => {
  return screenshotService
}