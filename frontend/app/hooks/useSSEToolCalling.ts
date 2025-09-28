import { useState, useRef, useCallback } from 'react'
import { ToolCall, SSEEvent, ExecutionState } from '../types/content-area-types'

interface QueuedEvent {
  event: SSEEvent
  timestamp: number
}

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
  const eventQueueRef = useRef<QueuedEvent[]>([])
  const lastEventTimeRef = useRef<number>(0)
  const eventTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const MIN_EVENT_DURATION = 3000 // 3 seconds minimum per event

  const clearToolCalls = useCallback(() => {
    setToolCalls([])
    setIsExecuting(false)
    setExecutionState({ isStarted: false })
    eventQueueRef.current = []
    lastEventTimeRef.current = 0
    if (eventTimeoutRef.current) {
      clearTimeout(eventTimeoutRef.current)
      eventTimeoutRef.current = null
    }
  }, [])

  const closeConnection = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
      setIsExecuting(false)
    }
  }, [])

  const handleSSEEventImmediate = useCallback((data: SSEEvent) => {
    switch (data.type) {
      case 'started':
        setExecutionState({ isStarted: true })
        break

      case 'tool_calls_detected':
        console.log(`Tool calls detected: ${data.count} tools in iteration ${data.iteration}`)
        break

      case 'tool_started':
        if (data.tool_name) {
          const newToolCall: ToolCall = {
            id: `${data.tool_name}-${Date.now()}-${data.iteration || 1}`,
            tool_name: data.tool_name,
            input: typeof data.input === 'object' ? JSON.stringify(data.input) : data.input,
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

      case 'tool_error':
        setToolCalls(prev =>
          prev.map(call => {
            if (call.status === 'started' && call.tool_name === data.tool_name) {
              return {
                ...call,
                output: `Error: ${data.error}`,
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

      case 'max_iterations_reached':
        setExecutionState(prev => ({
          ...prev,
          finalResult: 'Task execution stopped due to iteration limit'
        }))
        setIsExecuting(false)
        setIsConnected(false)
        break

      case 'error':
        setExecutionState(prev => ({
          ...prev,
          finalResult: `Error: ${data.message}`
        }))
        setIsExecuting(false)
        setIsConnected(false)
        break
    }
  }, [])

  const processNextEvent = useCallback(() => {
    const now = Date.now()
    const nextEvent = eventQueueRef.current.shift()

    if (nextEvent) {
      handleSSEEventImmediate(nextEvent.event)
      lastEventTimeRef.current = now

      if (eventQueueRef.current.length > 0) {
        eventTimeoutRef.current = setTimeout(processNextEvent, MIN_EVENT_DURATION)
      }
    }
  }, [handleSSEEventImmediate])

  const queueEvent = useCallback((event: SSEEvent) => {
    const now = Date.now()
    const timeSinceLastEvent = now - lastEventTimeRef.current

    eventQueueRef.current.push({ event, timestamp: now })

    if (!eventTimeoutRef.current) {
      if (timeSinceLastEvent >= MIN_EVENT_DURATION) {
        processNextEvent()
      } else {
        const remainingTime = MIN_EVENT_DURATION - timeSinceLastEvent
        eventTimeoutRef.current = setTimeout(processNextEvent, remainingTime)
      }
    }
  }, [processNextEvent])

  const handleSSEEvent = useCallback((data: SSEEvent) => {
    if (data.type === 'error') {
      handleSSEEventImmediate(data)
    } else {
      queueEvent(data)
    }
  }, [handleSSEEventImmediate, queueEvent])

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