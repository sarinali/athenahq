export interface Task {
  id: string
  content: string
  completed: boolean
  active?: boolean
}

export interface Todo {
  id: string
  title: string
  lastUpdated: Date
  tasks: Task[]
}

export interface ToolCall {
  id: string
  tool_name: string
  input?: string
  output?: string
  status: 'started' | 'completed'
  timestamp: Date
}

export interface ExecutionState {
  isStarted: boolean
  finalResult?: string
}

export interface SSEEvent {
  type: 'started' | 'tool_calls_detected' | 'tool_started' | 'tool_completed' | 'tool_error' | 'final_result' | 'max_iterations_reached' | 'error'
  tool_name?: string
  input?: string | object
  output?: string
  message?: string
  error?: string
  count?: number
  iteration?: number
}
