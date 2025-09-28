import React from 'react'
import { Play } from 'lucide-react'
import { motion } from 'framer-motion'

const ExecutionStartedItem = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-3"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="flex-shrink-0"
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <Play className="w-2 h-2 text-white fill-white" />
          </div>
        </motion.div>

        <div className="flex-1">
          <div className="text-sm font-medium text-blue-400">
            Execution Started
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Initializing tool calling process...
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ExecutionStartedItem