import React, { useState } from 'react'
import { ToolCall } from '../../types/content-area-types'
import { ChevronDown, ChevronRight, Loader2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getToolIcon } from '../../utils/toolIconMapping'

interface ToolCallItemProps {
  toolCall: ToolCall
}

const ToolCallItem = ({ toolCall }: ToolCallItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasOutput = toolCall.output && toolCall.output.trim().length > 0
  const ToolIcon = getToolIcon(toolCall.tool_name)

  const formatToolName = (toolName: string) => {
    return toolName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const toggleExpanded = () => {
    if (hasOutput) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex items-center gap-3 p-3 ${hasOutput ? 'cursor-pointer hover:bg-white/5' : ''} transition-colors`}
        onClick={toggleExpanded}
      >
        <div className="flex-shrink-0 relative">
          {toolCall.status === 'started' ? (
            <motion.div className="relative">
              {/* Tool icon in background */}
              <ToolIcon className="w-4 h-4 text-gray-400" />
              {/* Spinning loader overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-3 h-3 text-blue-400" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="relative"
            >
              {/* Tool icon */}
              <ToolIcon className="w-4 h-4 text-green-400" />
              {/* Small green checkmark overlay */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.1 }}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <Check className="w-1.5 h-1.5 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">
            {formatToolName(toolCall.tool_name)}
          </div>
          {toolCall.input && (
            <div className="text-xs text-gray-400 truncate mt-1">
              {toolCall.input.length > 50 ? `${toolCall.input.slice(0, 50)}...` : toolCall.input}
            </div>
          )}
        </div>

        {hasOutput && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasOutput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-10">
              <div className="bg-black/20 rounded-md p-3 border border-white/5">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                  {toolCall.output}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ToolCallItem