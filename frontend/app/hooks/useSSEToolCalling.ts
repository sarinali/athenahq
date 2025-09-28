import { useState, useRef, useCallback } from 'react'
import { ToolCall, SSEEvent, ExecutionState } from '../types/content-area-types'

interface UseSSEToolCallingReturn {
  toolCalls: ToolCall[]
  isConnected: boolean
  isExecuting: boolean
  executionState: ExecutionState
  startExecution: (prompt: string) => void
  clearToolCalls: () => void
}

export const useSSEToolCalling = (): UseSSEToolCallingReturn => {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionState, setExecutionState] = useState<ExecutionState>({ isStarted: false })
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearToolCalls = useCallback(() => {
    setToolCalls([])
    setIsExecuting(false)
    setExecutionState({ isStarted: false })
  }, [])

  const closeConnection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
      setIsExecuting(false)
    }
  }, [])

  const handleSSEEvent = useCallback((data: SSEEvent) => {
    switch (data.type) {
      case 'started':
        setExecutionState({ isStarted: true })
        break

      case 'tool_started':
        if (data.tool_name) {
          const newToolCall: ToolCall = {
            id: `${data.tool_name}-${Date.now()}`,
            tool_name: data.tool_name,
            input: data.input,
            status: 'started',
            timestamp: new Date(),
          }
          setToolCalls(prev => [...prev, newToolCall])
        }
        break

      case 'tool_completed':
        setToolCalls(prev =>
          prev.map(call => {
            if (call.status === 'started' && !prev.find(c => c.status === 'started' && c.id !== call.id)) {
              return {
                ...call,
                output: data.output,
                status: 'completed' as const,
              }
            }
            return call
          })
        )
        break

      case 'final_result':
        setExecutionState(prev => ({
          ...prev,
          finalResult: data.message
        }))
        setIsExecuting(false)
        setIsConnected(false)
        break
    }
  }, [])

  const startExecution = useCallback(async (prompt: string) => {
    closeConnection()
    clearToolCalls()
    setIsExecuting(true)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetch('http://localhost:8000/tool-calling/execute-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      setIsConnected(true)

      const decoder = new TextDecoder()

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim()
                if (dataStr) {
                  try {
                    const data: SSEEvent = JSON.parse(dataStr)
                    handleSSEEvent(data)
                  } catch (error) {
                    console.error('Error parsing SSE event:', error, dataStr)
                  }
                }
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error reading stream:', error)
          }
        } finally {
          setIsExecuting(false)
          setIsConnected(false)
        }
      }

      readStream()
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error starting SSE connection:', error)
      }
      setIsExecuting(false)
      setIsConnected(false)
    }
  }, [closeConnection, clearToolCalls, handleSSEEvent])

  return {
    toolCalls,
    isConnected,
    isExecuting,
    executionState,
    startExecution,
    clearToolCalls,
  }
}