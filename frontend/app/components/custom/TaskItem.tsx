import React, { useState, useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Task } from '../../types/content-area-types'
import { Check } from 'lucide-react'
import ActiveDraggable from './ActiveDraggable'

interface TaskItemProps {
  task?: Task
  todoId: string
  onUpdateTask?: (todoId: string, taskId: string, updates: Partial<Task>) => void
  onDeleteTask?: (todoId: string, taskId: string) => void
  onAddTask?: (todoId: string, content?: string) => string
  isNewTaskItem?: boolean
}

const TaskItem = ({ task, todoId, onUpdateTask, onDeleteTask, onAddTask, isNewTaskItem = false }: TaskItemProps) => {
  const [content, setContent] = useState(task?.content || '')
  const [isEditing, setIsEditing] = useState(isNewTaskItem)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isOver, setNodeRef } = useDroppable({
    id: task?.id || 'new-task',
  })

  useEffect(() => {
    setContent(task?.content || '')
  }, [task])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(content.length, content.length)
    }
  }, [isEditing, content])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      if (isNewTaskItem) {
        if (content.trim() && onAddTask) {
          onAddTask(todoId, content.trim())
          setContent('')
        }
      } else {
        handleBlur()
        if (onAddTask) {
          onAddTask(todoId, '')
        }
      }
    }

    if (e.key === 'Escape') {
      if (isNewTaskItem) {
        setContent('')
      } else {
        setContent(task?.content || '')
        setIsEditing(false)
      }
    }

    if (e.key === 'Backspace' && content.trim() === '' && !isNewTaskItem && task && onDeleteTask) {
      e.preventDefault()
      onDeleteTask(todoId, task.id)
    }
  }

  const handleBlur = () => {
    if (isNewTaskItem) return

    if (task && content !== task.content && onUpdateTask) {
      onUpdateTask(todoId, task.id, { content: content.trim() })
    }
    setIsEditing(false)
  }

  const handleCheckboxChange = () => {
    if (task && onUpdateTask) {
      onUpdateTask(todoId, task.id, { completed: !task.completed })
    }
  }

  const handleTextClick = () => {
    if (!isNewTaskItem) {
      setIsEditing(true)
    }
  }

  const shouldShowDottedBorder = isOver && !isNewTaskItem

  return (
    <div
      ref={setNodeRef}
      data-task-id={task?.id || 'new-task'}
      className={`flex flex-row items-start gap-x-3 group p-2 rounded-md border-1 border-dashed transition-all duration-200 ${
        shouldShowDottedBorder ? 'border-[#525252] bg-[#1a1a1a]' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="flex items-center gap-2"></div>
      <div
        className={`w-5  h-5 border-1 rounded-full cursor-pointer transition-colors flex items-center justify-center ${
          task?.completed ? 'bg-green-500 border-green-500' : 'border-[#888888] hover:border-white'
        }`}
        onClick={handleCheckboxChange}
      >
        {task?.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>

      <div className="flex items-center gap-2">
        <textarea
          ref={textareaRef}
          className={`inline-block bg-transparent border-none outline-none resize-none overflow-hidden text-white placeholder-[#888888] leading-5 ${
            task?.completed ? 'line-through opacity-60' : ''
          } ${!isEditing && 'cursor-text'} min-h-6`}
          value={content}
          onChange={handleContentChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isNewTaskItem ? 'Add a new task...' : 'Enter task content...'}
          rows={1}
          readOnly={!isEditing}
          onClick={() => {
            if (!isEditing) {
              handleTextClick?.()
            }
          }}
        />

        <div />
      </div>
      {task?.active && <ActiveDraggable id={`active-${task.id}`} />}
      <div />
    </div>
  )
}

export default TaskItem
