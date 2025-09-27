import './styles/app.css'
import ContentArea from './components/custom/ContentArea'
import Sidebar from './components/custom/Sidebar'
import Header from './components/layout/Header'
import { useState } from 'react'
import { Todo, Task } from './types/content-area-types'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: 'Plan project architecture',
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      tasks: [
        { id: '1-1', content: 'Research best practices', completed: false },
        { id: '1-2', content: 'Design database schema', completed: true },
      ]
    },
    {
      id: '2',
      title: 'Set up development environment',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      tasks: [
        { id: '2-1', content: 'Install dependencies', completed: true },
        { id: '2-2', content: 'Configure build tools', completed: false },
      ]
    },
    {
      id: '3',
      title: 'Create initial UI components',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tasks: [
        { id: '3-1', content: 'Design component structure', completed: false },
      ]
    },
    {
      id: '4',
      title: 'Implement todo functionality',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      tasks: [
        { id: '4-1', content: 'Add task creation', completed: false },
        { id: '4-2', content: 'Implement task editing', completed: false },
      ]
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
      tasks: [],
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

  const handleUpdateTask = (todoId: string, taskId: string, updates: Partial<Task>) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              tasks: todo.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
              lastUpdated: new Date(),
            }
          : todo
      )
    )

    // Update selected todo if it's the one being updated
    if (selectedTodo && selectedTodo.id === todoId) {
      setSelectedTodo({
        ...selectedTodo,
        tasks: selectedTodo.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
        lastUpdated: new Date(),
      })
    }
  }

  const handleAddTask = (todoId: string, content: string = '') => {
    const newTask: Task = {
      id: `${todoId}-${Date.now()}`,
      content,
      completed: false,
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              tasks: [...todo.tasks, newTask],
              lastUpdated: new Date(),
            }
          : todo
      )
    )

    // Update selected todo if it's the one being updated
    if (selectedTodo && selectedTodo.id === todoId) {
      setSelectedTodo({
        ...selectedTodo,
        tasks: [...selectedTodo.tasks, newTask],
        lastUpdated: new Date(),
      })
    }

    return newTask.id
  }

  const handleDeleteTask = (todoId: string, taskId: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              tasks: todo.tasks.filter((task) => task.id !== taskId),
              lastUpdated: new Date(),
            }
          : todo
      )
    )

    // Update selected todo if it's the one being updated
    if (selectedTodo && selectedTodo.id === todoId) {
      setSelectedTodo({
        ...selectedTodo,
        tasks: selectedTodo.tasks.filter((task) => task.id !== taskId),
        lastUpdated: new Date(),
      })
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
        <Header onNewTodo={handleNewTodo} />
        <ContentArea
          selectedTodo={selectedTodo}
          onUpdateTodo={handleUpdateTodo}
          onUpdateTask={handleUpdateTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  )
}
