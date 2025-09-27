import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import { Plus } from 'lucide-react'
import TodoItem from './TodoItem'
import { Todo } from '../../types/content-area-types'

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

  return (
    <GradientBorderView className="m-2 rounded-2xl" contentClassName="w-[240px] h-full rounded-2xl flex flex-col">
      {/* Header with New Todo button */}

      <div className="w-full flex justify-end p-2">
        
      </div>
      <div className="h-10" />

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {todos.map((todo) => (
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
    </GradientBorderView>
  )
}

export default Sidebar
