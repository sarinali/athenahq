import { ConveyorApi } from '@/lib/preload/shared'

export interface ScreenshotResult {
  success: boolean
  message: string
  timestamp: number
}

export class ScreenshotApi extends ConveyorApi {
  startPolling = (apiEndpoint: string, pollInterval?: number) =>
    pollInterval
      ? this.invoke('screenshot-start-polling', apiEndpoint, pollInterval)
      : this.invoke('screenshot-start-polling', apiEndpoint)

  stopPolling = () =>
    this.invoke('screenshot-stop-polling')

  isPolling = () =>
    this.invoke('screenshot-is-polling')

  captureManual = (): Promise<ScreenshotResult> =>
    this.invoke('screenshot-capture-manual')

  setEndpoint = (apiEndpoint: string) =>
    this.invoke('screenshot-set-endpoint', apiEndpoint)

  setInterval = (interval: number) =>
    this.invoke('screenshot-set-interval', interval)
}