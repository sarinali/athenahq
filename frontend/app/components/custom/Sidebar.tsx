import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import TodoItem from './TodoItem'
import { Todo } from '../../types/content-area-types'

interface TodoSection {
  title: string
  todos: Todo[]
}

const categorizeTodosByDate = (todos: Todo[]): TodoSection[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todayTodos: Todo[] = []
  const yesterdayTodos: Todo[] = []
  const previous7DaysTodos: Todo[] = []
  const previous30DaysTodos: Todo[] = []
  const olderTodos: Todo[] = []

  todos.forEach((todo) => {
    const todoDate = new Date(todo.lastUpdated)

    if (todoDate >= today) {
      todayTodos.push(todo)
    } else if (todoDate >= yesterday) {
      yesterdayTodos.push(todo)
    } else if (todoDate >= sevenDaysAgo) {
      previous7DaysTodos.push(todo)
    } else if (todoDate >= thirtyDaysAgo) {
      previous30DaysTodos.push(todo)
    } else {
      olderTodos.push(todo)
    }
  })

  const sections: TodoSection[] = []

  if (todayTodos.length > 0) {
    sections.push({ title: 'Today', todos: todayTodos })
  }
  if (yesterdayTodos.length > 0) {
    sections.push({ title: 'Yesterday', todos: yesterdayTodos })
  }
  if (previous7DaysTodos.length > 0) {
    sections.push({ title: 'Previous 7 days', todos: previous7DaysTodos })
  }
  if (previous30DaysTodos.length > 0) {
    sections.push({ title: 'Previous 30 days', todos: previous30DaysTodos })
  }
  if (olderTodos.length > 0) {
    sections.push({ title: 'Older', todos: olderTodos })
  }

  return sections
}

interface SidebarProps {
  todos: Todo[]
  activeTodoId: string
  onTodoSelect: (todo: Todo) => void
  onNewTodo: () => void
  onCompleteTodo?: (id: string) => void
}

const Sidebar = ({ todos, activeTodoId, onTodoSelect, onNewTodo, onCompleteTodo }: SidebarProps) => {
  const handleTodoClick = (todoId: string) => {
    const selectedTodo = todos.find((todo) => todo.id === todoId)
    if (selectedTodo) {
      onTodoSelect(selectedTodo)
    }
  }

  const sections = categorizeTodosByDate(todos)

  return (
    <GradientBorderView className="m-2 rounded-2xl" contentClassName="w-[240px] h-full rounded-2xl flex flex-col">
      {/* Header with New Todo button */}
      <div className="w-full flex justify-end p-2"></div>
      <div className="h-10" />

      {/* Todo List with Sections */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            {/* Section Header */}
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">{section.title}</div>

            {/* Section Todos */}
            <div className="space-y-2">
              {section.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  title={todo.title}
                  lastUpdated={todo.lastUpdated}
                  isActive={activeTodoId === todo.id}
                  onClick={() => handleTodoClick(todo.id)}
                  onComplete={onCompleteTodo}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GradientBorderView>
  )
}

export default Sidebar
