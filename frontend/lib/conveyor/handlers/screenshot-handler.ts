import { handle } from '@/lib/main/shared'
import { getScreenshotService } from '@/lib/main/screenshot-service'

export const registerScreenshotHandlers = () => {
  console.log('[ScreenshotHandler] Registering screenshot IPC handlers')

  handle('screenshot-start-polling', (...args: [string] | [string, number]) => {
    console.log('[ScreenshotHandler] screenshot-start-polling called with args:', args)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for start-polling')
      return false
    }

    const [apiEndpoint, pollInterval] = args
    try {
      service.setApiEndpoint(apiEndpoint)
      if (pollInterval) {
        service.setPollInterval(pollInterval)
      }

      service.startPolling()
      console.log('[ScreenshotHandler] Polling started successfully')
      return true
    } catch (error) {
      console.error('[ScreenshotHandler] Error starting polling:', error)
      return false
    }
  })

  handle('screenshot-stop-polling', () => {
    console.log('[ScreenshotHandler] screenshot-stop-polling called')
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for stop-polling')
      return false
    }

    try {
      service.stopPolling()
      console.log('[ScreenshotHandler] Polling stopped successfully')
      return true
    } catch (error) {
      console.error('[ScreenshotHandler] Error stopping polling:', error)
      return false
    }
  })

  handle('screenshot-is-polling', () => {
    console.log('[ScreenshotHandler] screenshot-is-polling called')
    const service = getScreenshotService()
    const result = service ? service.isPolling() : false
    console.log('[ScreenshotHandler] Polling status:', result)
    return result
  })

  handle('screenshot-capture-manual', async () => {
    console.log('[ScreenshotHandler] screenshot-capture-manual called')
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for manual capture')
      return {
        success: false,
        message: 'Screenshot service not available',
        timestamp: Date.now(),
      }
    }

    try {
      const result = await service.captureManualScreenshot()
      return result
    } catch (error) {
      console.error('[ScreenshotHandler] Error in manual capture:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      }
    }
  })

  handle('screenshot-capture-with-intent', async (intent: string) => {
    console.log('[ScreenshotHandler] screenshot-capture-with-intent called with intent:', intent)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for capture with intent')
      return {
        success: false,
        message: 'Screenshot service not available',
        timestamp: Date.now(),
      }
    }

    try {
      const result = await service.captureScreenshotWithIntent(intent)
      console.log('[ScreenshotHandler] Capture with intent result:', result)
      return result
    } catch (error) {
      console.error('[ScreenshotHandler] Error during capture with intent:', error)
      return {
        success: false,
        message: `Capture with intent failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  })

  handle('screenshot-set-endpoint', (apiEndpoint: string) => {
    console.log('[ScreenshotHandler] screenshot-set-endpoint called with:', apiEndpoint)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for set-endpoint')
      return false
    }

    try {
      service.setApiEndpoint(apiEndpoint)
      console.log('[ScreenshotHandler] Endpoint set successfully')
      return true
    } catch (error) {
      console.error('[ScreenshotHandler] Error setting endpoint:', error)
      return false
    }
  })

  handle('screenshot-set-interval', (interval: number) => {
    console.log('[ScreenshotHandler] screenshot-set-interval called with:', interval)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for set-interval')
      return false
    }

    try {
      service.setPollInterval(interval)
      console.log('[ScreenshotHandler] Interval set successfully')
      return true
    } catch (error) {
      console.error('[ScreenshotHandler] Error setting interval:', error)
      return false
    }
  })

  handle('screenshot-send-string', async (message: string) => {
    console.log('[ScreenshotHandler] screenshot-send-string called with message:', message)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for send-string')
      return {
        success: false,
        message: 'Screenshot service not available',
        timestamp: Date.now(),
      }
    }

    try {
      // Send the string to the backend
      const result = await service.sendStringToBackend(message)
      console.log('[ScreenshotHandler] Send string result:', result)
      return result
    } catch (error) {
      console.error('[ScreenshotHandler] Error sending string:', error)
      return {
        success: false,
        message: `Send string failed: ${error}`,
        timestamp: Date.now(),
      }
    }
  })

  handle('screenshot-set-default-intent', (intent: string) => {
    console.log('[ScreenshotHandler] screenshot-set-default-intent called with:', intent)
    const service = getScreenshotService()
    if (!service) {
      console.error('[ScreenshotHandler] Screenshot service not available for set-default-intent')
      return false
    }

    try {
      service.setDefaultIntent(intent)
      console.log('[ScreenshotHandler] Default intent set successfully')
      return true
    } catch (error) {
      console.error('[ScreenshotHandler] Error setting default intent:', error)
      return false
    }
  })

  console.log('[ScreenshotHandler] All screenshot IPC handlers registered successfully')
}
