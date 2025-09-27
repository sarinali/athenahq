import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { ScreenshotApi } from './screenshot-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  screenshot: new ScreenshotApi(electronAPI),
}

export type ConveyorApi = typeof conveyor
