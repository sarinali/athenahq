import React, { useState } from 'react'
import { DndContext, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import TaskItem from './TaskItem'
import { Todo, Task } from '../../types/content-area-types'
import AvatarButton from './AvatarButton'
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
  const [activeTaskIds, setActiveTaskIds] = useState<Record<string, string | null>>({})

  React.useEffect(() => {
    setTitleValue(selectedTodo?.title || '')
  }, [selectedTodo])

  React.useEffect(() => {
    if (!selectedTodo) return

    setActiveTaskIds((prev) => {
      if (prev.hasOwnProperty(selectedTodo.id)) {
        return prev
      }

      const firstTaskId = selectedTodo.tasks[0]?.id ?? null
      return { ...prev, [selectedTodo.id]: firstTaskId }
    })
  }, [selectedTodo])

  React.useEffect(() => {
    if (!selectedTodo) return

    const tasks = selectedTodo.tasks

    setActiveTaskIds((prev) => {
      const currentActive = prev[selectedTodo.id]

      if (tasks.length === 0) {
        if (currentActive === null || currentActive === undefined) {
          return prev
        }
        return { ...prev, [selectedTodo.id]: null }
      }

      if (currentActive && tasks.some((task) => task.id === currentActive)) {
        return prev
      }

      return { ...prev, [selectedTodo.id]: tasks[0].id }
    })
  }, [selectedTodo, selectedTodo?.tasks])

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
      if (selectedTodo) {
        setActiveTaskIds((prev) => ({
          ...prev,
          [selectedTodo.id]: over.id as string,
        }))
      }

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
                  {selectedTodo.tasks.map((task) => {
                    const persistedActive = activeTaskIds[selectedTodo.id]
                    const activeExists = persistedActive
                      ? selectedTodo.tasks.some((t) => t.id === persistedActive)
                      : false
                    const resolvedActiveId = activeExists
                      ? persistedActive
                      : selectedTodo.tasks[0]?.id ?? null

                    return (
                      <TaskItem
                        key={task.id}
                        task={{
                          ...task,
                          active: resolvedActiveId === task.id,
                        }}
                        todoId={selectedTodo.id}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        onAddTask={onAddTask}
                      />
                    )
                  })}
                  <TaskItem todoId={selectedTodo.id} onAddTask={onAddTask} isNewTaskItem={true} />
                </div>
              </div>
              
            </div>
          ) : (
            <div className="text-3xl font-bold text-white mb-4">Select a todo to view details</div>
          )}
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-30">
                <AvatarButton />
              </div>
    </DndContext>
  )
}

export default ContentArea
