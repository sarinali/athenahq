import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import {
  Trash,
  ListTodo,
  Sidebar as SidebarIcon,
  Type,
  List,
  Table,
  Paperclip,
} from 'lucide-react'

interface HeaderProps {
  onNewTodo: () => void
  noteCount: number
}

const Header = ({ onNewTodo, noteCount }: HeaderProps) => {
  const HeaderButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
    <GradientBorderView className="rounded-full" contentClassName="rounded-full bg-[#2a2a2a] group overflow-hidden">
      <button
        onClick={onClick}
        className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a]"
        aria-label={label}
      >
        <Icon className="h-4 w-4" />
      </button>
    </GradientBorderView>
  )

  return (
    <div className="w-full flex flex-row justify-between items-center px-2 py-2">
      {/* Left side - Sidebar toggle and title */}
      <div className="flex items-center gap-2">
        <HeaderButton icon={SidebarIcon} label="Toggle sidebar" />
        <div className="flex flex-col">
          <h1 className="text-white font-medium text-sm">Notes</h1>
          <p className="text-gray-400 text-xs">{noteCount} notes</p>
        </div>
      </div>

      {/* Center - Formatting buttons */}
      <GradientBorderView className="rounded-full" contentClassName="rounded-full bg-[#2a2a2a] group overflow-hidden">
        <div className="flex items-center">
          <button
            className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a] rounded-full"
            aria-label="Text formatting"
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a] rounded-full"
            aria-label="List options"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a] rounded-full"
            aria-label="Table"
          >
            <Table className="h-4 w-4" />
          </button>
          <button
            className="w-10 h-8 font-medium flex items-center justify-center transition-colors duration-300 hover:bg-[#3a3a3a] rounded-full"
            aria-label="Attachments"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>
      </GradientBorderView>

      {/* Right side - New Task and Delete */}
      <div className="flex items-center gap-2">
        <GradientBorderView className="rounded-full" contentClassName="rounded-full bg-[#2a2a2a] group overflow-hidden">
          <button
            onClick={onNewTodo}
            className="px-4 py-2 flex flex-row items-center justify-center gap-x-2 font-medium transition-colors duration-300 hover:bg-[#3a3a3a]">
            <ListTodo className="h-4 w-4" />
            New 
            List
          </button>
        </GradientBorderView>
        <HeaderButton icon={Trash} label="Delete" />
      </div>
    </div>
  )
}

export default Header
