import React, { useState } from 'react'
import { DndContext, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import TaskItem from './TaskItem'
import { Todo, Task } from '../../types/content-area-types'
import '@/lib/conveyor/conveyor.d.ts'

interface ContentAreaProps {
  selectedTodo: Todo | null
  onUpdateTodo?: (id: string, updates: Partial<Todo>) => void
  onUpdateTask?: (todoId: string, taskId: string, updates: Partial<Task>) => void
  onAddTask?: (todoId: string, content?: string) => string
  onDeleteTask?: (todoId: string, taskId: string) => void
}

const ContentArea = ({ selectedTodo, onUpdateTodo, onUpdateTask, onAddTask, onDeleteTask }: ContentAreaProps) => {
  const [titleValue, setTitleValue] = useState(selectedTodo?.title || '')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

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

  const handleDragStart = () => {
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const task = selectedTodo?.tasks.find((t) => t.id === over.id)
      const intent = task?.content || 'new task'
      console.log('🎯 Dragging over task with intent:', intent)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event

    if (over) {
      const task = selectedTodo?.tasks.find((t) => t.id === over.id)
      const intent = task?.content || 'new task'
      console.log('📌 Dropped on task with intent:', intent)
      setActiveTaskId(over.id as string)

      try {
        console.log('📸 Capturing screenshot for intent:', intent)
        await window.conveyor.screenshot.setEndpoint('http://localhost:8000')
        const result = await window.conveyor.screenshot.captureWithIntent(intent)
        console.log('📸 Screenshot result:', result)
      } catch (error) {
        console.error('📸 Failed to capture screenshot:', error)
      }
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex-1 p-6 overflow-hidden flex justify-center items-center">
        <div className="w-[800px] h-full flex flex-col p-6 rounded-lg">
          {selectedTodo ? (
            <div className="flex flex-col h-full relative">
              <input
                className="text-3xl font-bold text-white mb-6 bg-transparent border-none outline-none w-full rounded px-2 py-1 transition-colors relative z-10"
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                placeholder="Enter todo title..."
              />
              <div className="flex-1 overflow-y-auto relative z-20">
                <div className="space-y-2">
                  {selectedTodo.tasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={{ ...task, active: activeTaskId === task.id || (index === 0 && !activeTaskId) }}
                      todoId={selectedTodo.id}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                      onAddTask={onAddTask}
                    />
                  ))}
                  <TaskItem todoId={selectedTodo.id} onAddTask={onAddTask} isNewTaskItem={true} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-white mb-4">Select a todo to view details</div>
          )}
        </div>
      </div>
    </DndContext>
  )
}

export default ContentArea
