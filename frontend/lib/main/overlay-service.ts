import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import liquidGlass from 'electron-liquid-glass'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export class OverlayService {
  private overlayWindow: BrowserWindow | null = null
  private toastQueue: ToastData[] = []

  createOverlayWindow(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      return
    }

    try {
      const primaryDisplay = screen.getPrimaryDisplay()
      const { width: screenWidth } = primaryDisplay.workAreaSize

      const preloadPath = join(__dirname, '../preload/overlay-preload.js')

      this.overlayWindow = new BrowserWindow({
        width: 400,
        height: 30,
        x: screenWidth - 420,
        y: 60,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        focusable: false,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          preload: preloadPath,
        },
      })

      this.overlayWindow.webContents.once('did-finish-load', () => {
        try {
          const glassId = liquidGlass.addView(this.overlayWindow!.getNativeWindowHandle(), {
            cornerRadius: 16,
            opaque: false // Keep transparent for better glass effect
          })
          liquidGlass.unstable_setVariant(glassId, 1);
          liquidGlass.unstable_setScrim(glassId, 0);
          liquidGlass.unstable_setSubdued(glassId, 0);
          console.log('[OverlayService] Liquid glass effect applied successfully, ID:', glassId)
        } catch (error) {
          console.log('[OverlayService] Liquid glass not available, using fallback styling:', error)
        }
      })

      this.overlayWindow.setIgnoreMouseEvents(true, { forward: true })
      this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

      this.overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('[OverlayService] Failed to load overlay window:', errorCode, errorDescription, validatedURL)
      })

      this.overlayWindow.on('closed', () => {
        this.overlayWindow = null
      })

      if (process.env.NODE_ENV === 'development') {
        const devUrl = 'http://localhost:5173/overlay.html'
        this.overlayWindow.loadURL(devUrl)
      } else {
        const overlayPath = join(__dirname, '../app/overlay.html')
        this.overlayWindow.loadFile(overlayPath)
      }

      this.overlayWindow.webContents.on('did-finish-load', () => {
        this.processToastQueue()
      })

      this.overlayWindow.webContents.on('dom-ready', () => {
        // DOM ready
      })
    } catch (error) {
      console.error('[OverlayService] Error creating overlay window:', error)
    }
  }

  showToast(message: string, type: ToastData['type'], duration = 5000): void {
    const truncatedMessage = message.length > 60 ? message.substring(0, 57) + '...' : message

    const toast: ToastData = {
      id: Math.random().toString(36).substring(7),
      message: truncatedMessage,
      type,
      duration
    }

    this.toastQueue.push(toast)

    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) {
      this.createOverlayWindow()
    } else {
      this.processToastQueue()
    }
  }

  private processToastQueue(): void {
    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) {
      return
    }

    if (this.toastQueue.length === 0) {
      return
    }

    const toast = this.toastQueue.shift()
    if (!toast) {
      return
    }

    try {
      this.overlayWindow.webContents.send('show-toast', toast)

      this.overlayWindow.showInactive()

      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.hideToast(toast.id)
        }, toast.duration)
      }

      if (this.toastQueue.length > 0) {
        setTimeout(() => {
          this.processToastQueue()
        }, 500)
      }
    } catch (error) {
      console.error('[OverlayService] Error processing toast queue:', error)
    }
  }

  private hideToast(id: string): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      try {
        this.overlayWindow.webContents.send('hide-toast', id)

        setTimeout(() => {
          if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.hide()
          }
        }, 300)
      } catch (error) {
        console.error('[OverlayService] Error hiding toast:', error)
      }
    }
  }

  destroy(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.destroy()
      this.overlayWindow = null
    }
    this.toastQueue = []
  }
}

let overlayService: OverlayService | null = null

export const createOverlayService = (): OverlayService => {
  overlayService = new OverlayService()
  return overlayService
}

export const getOverlayService = (): OverlayService | null => {
  return overlayService
}