import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/icon.png?asset'
import { registerResourcesProtocol } from './protocols'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerScreenshotHandlers } from '@/lib/conveyor/handlers/screenshot-handler'
import { createScreenshotService } from './screenshot-service'
import { createOverlayService } from './overlay-service'

export function createAppWindow(): void {
  process.on('uncaughtException', (error) => {
    console.error('[App] Uncaught exception:', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[App] Unhandled rejection:', reason)
  })

  app.on('browser-window-created', (event, window) => {
    window.on('closed', () => {
      console.log('[App] Window closed')
    })
  })

  app.on('browser-window-blur', (event, window) => {
    console.log('[App] Window blurred')
  })

  app.on('browser-window-focus', (event, window) => {
    console.log('[App] Window focused')
  })

  registerResourcesProtocol()
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: '#000',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    //vibrancy: false,
    title: 'athenahq',

    maximizable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)
  registerScreenshotHandlers()

  try {
    createScreenshotService(mainWindow)
  } catch (error) {
    console.error('[App] Error creating screenshot service:', error)
  }

  try {
    createOverlayService()
  } catch (error) {
    console.error('[App] Error creating overlay service:', error)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    console.log('[App] Window closing')
  })

  mainWindow.on('closed', () => {
    console.log('[App] Window closed')
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log('[App] Navigation handling')
  })

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[App] Failed to load:', errorCode, errorDescription, validatedURL)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const indexPath = join(__dirname, '../renderer/index.html')
    mainWindow.loadFile(indexPath)
  }
}
