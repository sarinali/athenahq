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
  type: 'started' | 'tool_started' | 'tool_completed' | 'final_result'
  tool_name?: string
  input?: string
  output?: string
  message?: string
}
