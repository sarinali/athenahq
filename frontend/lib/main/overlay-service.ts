import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

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

    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth } = primaryDisplay.workAreaSize

    this.overlayWindow = new BrowserWindow({
      width: 400,
      height: 120,
      x: screenWidth - 420,
      y: 20,
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
        preload: join(__dirname, '../preload/overlay-preload.js'),
      },
    })

    this.overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    this.overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

    if (process.env.NODE_ENV === 'development') {
      this.overlayWindow.loadURL('http://localhost:5173/overlay.html')
    } else {
      this.overlayWindow.loadFile(join(__dirname, '../renderer/overlay.html'))
    }

    this.overlayWindow.webContents.on('did-finish-load', () => {
      this.processToastQueue()
    })
  }

  showToast(message: string, type: ToastData['type'], duration = 5000): void {
    const toast: ToastData = {
      id: Math.random().toString(36).substring(7),
      message,
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
    if (!this.overlayWindow || this.overlayWindow.isDestroyed() || this.toastQueue.length === 0) {
      return
    }

    const toast = this.toastQueue.shift()
    if (!toast) return

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
  }

  private hideToast(id: string): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.webContents.send('hide-toast', id)

      setTimeout(() => {
        if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
          this.overlayWindow.hide()
        }
      }, 300)
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