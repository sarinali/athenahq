import React, { useState } from 'react'
import TaskItem from './TaskItem'

interface Todo {
  id: string
  title: string
  lastUpdated: Date
}

interface ContentAreaProps {
  selectedTodo: Todo | null
  onUpdateTodo?: (id: string, updates: Partial<Todo>) => void
}

const ContentArea = ({ selectedTodo, onUpdateTodo }: ContentAreaProps) => {
  const [titleValue, setTitleValue] = useState(selectedTodo?.title || '')

  // Update local state when selectedTodo changes
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
          <div>
            <input
              className="text-3xl font-bold text-white mb-4 bg-transparent border-none outline-none w-full rounded px-2 py-1 transition-colors"
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              placeholder="Enter todo title..."
            />
          </div>
        ) : (
          <div className="text-3xl font-bold text-white mb-4">Select a todo to view details</div>
        )}
         <TaskItem />   
      </div>
    </div>
  )
}

export default ContentArea
