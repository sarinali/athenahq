export interface Task {
  id: string
  content: string
  completed: boolean
}

export interface Todo {
  id: string
  title: string
  lastUpdated: Date
  tasks: Task[]
}