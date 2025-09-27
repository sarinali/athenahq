import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import { Trash, ListTodo } from 'lucide-react'

const Header = () => {
  return (
    <div className="w-full flex flex-row justify-between items-center px-4 py-2">
      <div />
      <GradientBorderView>
        <button className="px-4 py-2 flex flex-row items-center justify-center gap-x-2 font-medium">
          <ListTodo className="h-4 w-4" />
          New Task
        </button>
      </GradientBorderView>
      <GradientBorderView>
        <button className="px-4 py-2 font-medium flex items-center justify-center" aria-label="Delete">
          <Trash className="h-4 w-4" />
        </button>
      </GradientBorderView>
    </div>
  )
}

export default Header
