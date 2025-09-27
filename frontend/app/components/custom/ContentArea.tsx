import React, { useState } from 'react'
import TaskItem from './TaskItem'
import { Todo, Task } from '../../types/content-area-types'

interface ContentAreaProps {
  selectedTodo: Todo | null
  onUpdateTodo?: (id: string, updates: Partial<Todo>) => void
  onUpdateTask?: (todoId: string, taskId: string, updates: Partial<Task>) => void
  onAddTask?: (todoId: string, content?: string) => string
  onDeleteTask?: (todoId: string, taskId: string) => void
}

const ContentArea = ({ selectedTodo, onUpdateTodo, onUpdateTask, onAddTask, onDeleteTask }: ContentAreaProps) => {
  const [titleValue, setTitleValue] = useState(selectedTodo?.title || '')

  React.useEffect(() => {
    setTitleValue(selectedTodo?.title || '')
  }, [selectedTodo])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value)
  }

  const handleTitleBlur = () => {
    if (selectedTodo && titleValue !== selectedTodo.title && onUpdateTodo) {
      onUpdateTodo(selectedTodo.id, {
        title: titleValue,
        lastUpdated: new Date(),
      })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur()
    }
    if (e.key === 'Escape') {
      setTitleValue(selectedTodo?.title || '')
    }
  }

  return (
    <div className="flex-1 p-6 overflow-hidden flex justify-center items-center">
      <div className="w-[800px] h-full flex flex-col p-6 rounded-lg">
        {selectedTodo ? (
          <div className="flex flex-col h-full">
            <input
              className="text-3xl font-bold text-white mb-6 bg-transparent border-none outline-none w-full rounded px-2 py-1 transition-colors"
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              placeholder="Enter todo title..."
            />
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {selectedTodo.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    todoId={selectedTodo.id}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onAddTask={onAddTask}
                  />
                ))}
                <TaskItem
                  todoId={selectedTodo.id}
                  onAddTask={onAddTask}
                  isNewTaskItem={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-3xl font-bold text-white mb-4">Select a todo to view details</div>
        )}
      </div>
    </div>
  )
}

export default ContentArea
