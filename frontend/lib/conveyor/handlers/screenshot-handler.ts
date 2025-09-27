import { handle } from '@/lib/main/shared'
import { getScreenshotService } from '@/lib/main/screenshot-service'

export const registerScreenshotHandlers = () => {
  handle('screenshot-start-polling', (...args: [string] | [string, number]) => {
    const service = getScreenshotService()
    if (!service) return false

    const [apiEndpoint, pollInterval] = args
    service.setApiEndpoint(apiEndpoint)
    if (pollInterval) {
      service.setPollInterval(pollInterval)
    }

    service.startPolling()
    return true
  })

  handle('screenshot-stop-polling', () => {
    const service = getScreenshotService()
    if (!service) return false

    service.stopPolling()
    return true
  })

  handle('screenshot-is-polling', () => {
    const service = getScreenshotService()
    return service ? service.isPolling() : false
  })

  handle('screenshot-capture-manual', () => {
    const service = getScreenshotService()
    if (!service) {
      return Promise.resolve({
        success: false,
        message: 'Screenshot service not available',
        timestamp: Date.now()
      })
    }

    return service.captureManualScreenshot()
  })

  handle('screenshot-set-endpoint', (apiEndpoint: string) => {
    const service = getScreenshotService()
    if (!service) return false

    service.setApiEndpoint(apiEndpoint)
    return true
  })

  handle('screenshot-set-interval', (interval: number) => {
    const service = getScreenshotService()
    if (!service) return false

    service.setPollInterval(interval)
    return true
  })
}