import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface ActiveDraggableProps {
  id: string
  isActive?: boolean
}

const ActiveDraggable = ({ id, isActive = false }: ActiveDraggableProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDndDragging,
  } = useDraggable({
    id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`px-3 py-1 rounded-2xl cursor-grab active:cursor-grabbing transition-colors duration-200 border border-transparent select-none relative z-[9999] ${
        isActive ? 'bg-[#0F6200]' : 'bg-[#0F6200]'
      } ${isDndDragging ? 'opacity-80 scale-105 rotate-2 shadow-lg' : ''}`}
    >
      <div className={`font-medium text-xs truncate ${isActive ? 'text-[#8FFF2D]' : 'text-[#8FFF2D]'}`}>
        {isActive ? 'Active' : 'Active'}
      </div>
    </div>
  )
}

export default ActiveDraggable
