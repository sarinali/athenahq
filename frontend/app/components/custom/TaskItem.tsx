import React, { useState, useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Task } from '../../types/content-area-types'
import { Check } from 'lucide-react'
import ActiveDraggable from './ActiveDraggable'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import Smiley1 from '../../assets/smiley1.svg'
import Smiley2 from '../../assets/smiley2.svg'
import Smiley3 from '../../assets/smiley3.svg'
import Smiley4 from '../../assets/smiley4.svg'
import { useSSEToolCalling } from '../../hooks/useSSEToolCalling'
import ToolCallItem from './ToolCallItem'
import ExecutionStartedItem from './ExecutionStartedItem'
import FinalResultItem from './FinalResultItem'

interface TaskItemProps {
  task?: Task
  todoId: string
  onUpdateTask?: (todoId: string, taskId: string, updates: Partial<Task>) => void
  onDeleteTask?: (todoId: string, taskId: string) => void
  onAddTask?: (todoId: string, content?: string) => string
  isNewTaskItem?: boolean
  onHighlightChange?: (isHighlighted: boolean) => void
}

const TaskItem = ({
  task,
  todoId,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  isNewTaskItem = false,
  onHighlightChange,
}: TaskItemProps) => {
  const [content, setContent] = useState(task?.content || '')
  const [isEditing, setIsEditing] = useState(isNewTaskItem)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [currentSmileyIndex, setCurrentSmileyIndex] = useState(0)
  const [isHoveringPopover, setIsHoveringPopover] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toolCalls, isExecuting, executionState, startExecution, clearToolCalls } = useSSEToolCalling()

  const { isOver, setNodeRef } = useDroppable({
    id: task?.id || 'new-task',
  })

  const smileys = [Smiley1, Smiley2, Smiley3, Smiley4]
  const currentSmileySrc = smileys[currentSmileyIndex]

  useEffect(() => {
    setContent(task?.content || '')
  }, [task])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(content.length, content.length)
    } else {
      setIsHighlighted(false)
    }
  }, [isEditing, content])

  useEffect(() => {
    onHighlightChange?.(isHighlighted)
    setIsPopoverOpen(isHighlighted || isExecuting || toolCalls.length > 0 || executionState.isStarted)
  }, [isHighlighted, isExecuting, toolCalls.length, executionState.isStarted, onHighlightChange])

  useEffect(() => {
    if (!isPopoverOpen) {
      clearToolCalls()
    }
  }, [isPopoverOpen, clearToolCalls])

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

  const handleSelectionChange = () => {
    if (textareaRef.current && isEditing) {
      const isEntireLineHighlighted = checkIfEntireLineHighlighted(textareaRef.current)
      setIsHighlighted(isEntireLineHighlighted)
      onHighlightChange?.(isEntireLineHighlighted)
    }
  }

  const handleSmileyHover = () => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * smileys.length)
    } while (newIndex === currentSmileyIndex)
    setCurrentSmileyIndex(newIndex)
  }

  const handlePopoverHover = () => {
    handleSmileyHover()
    setIsHoveringPopover(true)
  }

  const handleDoItForMe = () => {
    if (content.trim() && !isExecuting) {
      startExecution(content.trim())
    }
  }

  const shouldShowDottedBorder = isOver && !isNewTaskItem

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          ref={setNodeRef}
          data-task-id={task?.id || 'new-task'}
          className={`flex flex-row items-start gap-x-3 group p-2 rounded-md border-1 border-dashed transition-all duration-200 ${
            shouldShowDottedBorder ? 'border-[#525252] bg-[#1a1a1a]' : 'border-transparent bg-transparent'
          }`}
        >
          <div
            className={`w-5 h-5 border-1 rounded-full cursor-pointer transition-colors flex items-center justify-center ${
              task?.completed ? 'bg-green-500 border-green-500' : 'border-[#888888] hover:border-white'
            }`}
            onClick={handleCheckboxChange}
          >
            {task?.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>

          <div className="flex min-w-0 ">
            <textarea
              ref={textareaRef}
              className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden text-white placeholder-[#888888] leading-5 ${
                task?.completed ? 'line-through opacity-60' : ''
              } ${!isEditing ? 'cursor-text' : ''} min-h-6 ${isHighlighted ? 'bg-blue-500/20' : ''}`}
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onSelect={handleSelectionChange}
              onMouseUp={handleSelectionChange}
              placeholder={isNewTaskItem ? 'Add a new task...' : 'Enter task content...'}
              rows={1}
              readOnly={!isEditing}
              onClick={() => {
                if (!isEditing) {
                  handleTextClick()
                }
              }}
            />
          </div>

          {task?.active && <ActiveDraggable id={`active-${task.id}`} />}
        </div>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="border-none p-0 bg-transparent w-auto max-w-sm" sideOffset={8}>
        <AnimatePresence>
          {isPopoverOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="rounded-lg bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden"
            >
              {!isExecuting && toolCalls.length === 0 && (
                <motion.div
                  className="cursor-pointer p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onHoverStart={handlePopoverHover}
                  onHoverEnd={() => setIsHoveringPopover(false)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={handleDoItForMe}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isHoveringPopover ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Avatar className="size-6">
                        <AvatarFallback
                          className="overflow-hidden"
                          style={{
                            background: 'white',
                          }}
                        >
                          <img src={currentSmileySrc} alt="smiley" className="w-4 h-4 object-contain" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="text-sm font-medium text-white">Do it for me</div>
                  </div>
                </motion.div>
              )}

              {(isExecuting || toolCalls.length > 0 || executionState.isStarted) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="max-h-64 overflow-y-auto"
                >
                  <AnimatePresence mode="wait">
                    {(() => {
                      if (executionState.finalResult) {
                        return (
                          <FinalResultItem
                            key="final-result"
                            message={executionState.finalResult}
                            smileySrc={currentSmileySrc}
                          />
                        )
                      }

                      const currentlyExecuting = toolCalls.find(call => call.status === 'started')
                      if (currentlyExecuting) {
                        return (
                          <ToolCallItem
                            key={currentlyExecuting.id}
                            toolCall={currentlyExecuting}
                          />
                        )
                      }

                      const completedTools = toolCalls.filter(call => call.status === 'completed')
                      if (completedTools.length > 0) {
                        const mostRecentCompleted = completedTools[completedTools.length - 1]
                        return (
                          <ToolCallItem
                            key={mostRecentCompleted.id}
                            toolCall={mostRecentCompleted}
                          />
                        )
                      }

                      if (executionState.isStarted) {
                        return <ExecutionStartedItem key="execution-started" />
                      }

                      return null
                    })()}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

export const checkIfEntireLineHighlighted = (element: HTMLTextAreaElement | HTMLInputElement): boolean => {
  const selectionStart = element.selectionStart
  const selectionEnd = element.selectionEnd
  const textLength = element.value.length

  return selectionStart === 0 && selectionEnd === textLength && textLength > 0
}

export default TaskItem
