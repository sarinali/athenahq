import React from 'react'

interface TodoItemProps {
  id: string
  title: string
  lastUpdated: Date
  isActive?: boolean
  onClick?: () => void
  onComplete?: (id: string) => void
}

const TodoItem = ({ title, lastUpdated, isActive = false, onClick }: TodoItemProps) => {
  const formatRelativeDate = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div
        className={`px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 border ${
          isActive ? 'bg-[#3a3a3a] border-[#313131]' : 'border-transparent hover:bg-[#2a2a2a]'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-x-3">
         
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">{title || 'Untitled'}</div>
            <div className="text-[#888888] text-xs flex items-center gap-x-2 mt-1">
              <span className="text-white">{formatRelativeDate(lastUpdated)}</span>
              <span>{formatTime(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>
      <div />
    </>
  )
}

export default TodoItem
