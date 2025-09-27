import { contextBridge, ipcRenderer } from 'electron'

interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const overlayAPI = {
  onShowToast: (callback: (toast: ToastData) => void) => {
    ipcRenderer.on('show-toast', (_, toast) => callback(toast))
  },
  onHideToast: (callback: (id: string) => void) => {
    ipcRenderer.on('hide-toast', (_, id) => callback(id))
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('show-toast')
    ipcRenderer.removeAllListeners('hide-toast')
  }
}

contextBridge.exposeInMainWorld('overlayAPI', overlayAPI)