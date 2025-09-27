import './styles/app.css'
import ContentArea from './components/custom/ContentArea'
import Sidebar from './components/custom/Sidebar'
import Header from './components/layout/Header'
import { useState } from 'react'

interface Todo {
  id: string
  title: string
  lastUpdated: Date
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: 'Plan project architecture',
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: '2',
      title: 'Set up development environment',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      id: '3',
      title: 'Create initial UI components',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '4',
      title: 'Implement todo functionality',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ])

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(todos[3]) // Select the most recent todo by default
  const [activeTodoId, setActiveTodoId] = useState<string>('4')

  const handleTodoSelect = (todo: Todo) => {
    setSelectedTodo(todo)
    setActiveTodoId(todo.id)
  }

  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prevTodos) =>
      prevTodos
        .map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    )

    // Update selected todo if it's the one being updated
    if (selectedTodo && selectedTodo.id === id) {
      setSelectedTodo({ ...selectedTodo, ...updates })
    }
  }

  const handleNewTodo = () => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: 'New Todo',
      lastUpdated: new Date(),
    }
    setTodos((prev) => [newTodo, ...prev].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()))
    setActiveTodoId(newTodo.id)
    setSelectedTodo(newTodo)
  }

  const handleCompleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))

    // If the completed todo was selected, clear the selection
    if (selectedTodo && selectedTodo.id === id) {
      setSelectedTodo(null)
      setActiveTodoId('')
    }
  }

  return (
    <div className="flex flex-row w-full">
      <Sidebar
        todos={todos}
        activeTodoId={activeTodoId}
        onTodoSelect={handleTodoSelect}
        onNewTodo={handleNewTodo}
        onCompleteTodo={handleCompleteTodo}
      />
      <div className="flex flex-col w-full h-full ">
        <Header />
        <ContentArea selectedTodo={selectedTodo} onUpdateTodo={handleUpdateTodo} />
      </div>
    </div>
  )
}
