import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import { Trash, ListTodo } from 'lucide-react'

interface HeaderProps {
  onNewTodo: () => void
}

const Header = ({ onNewTodo }: HeaderProps) => {
  return (
    <div className="w-full flex flex-row justify-between items-center px-2 py-2">
      <div />
      <GradientBorderView className="rounded-full" contentClassName="rounded-full bg-[#2a2a2a] group overflow-hidden">
        <button
          onClick={onNewTodo}
          className="px-4 py-2 flex flex-row items-center justify-center gap-x-2 font-medium transition-colors duration-300 hover:bg-[#3a3a3a]">
          <ListTodo className="h-4 w-4" />
          New Task
        </button>
      </GradientBorderView>
      <GradientBorderView className="rounded-full" contentClassName="rounded-full bg-[#2a2a2a] group overflow-hidden">
        <button
          className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a]"
          aria-label="Delete"
        >
          <Trash className="h-4 w-4" />
        </button>
      </GradientBorderView>
    </div>
  )
}

export default Header
