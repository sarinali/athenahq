import React from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '../ui/avatar'

interface FinalResultItemProps {
  message: string
  smileySrc: string
}

const FinalResultItem = ({ message, smileySrc }: FinalResultItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="p-3"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.1 }}
          className="flex-shrink-0 mt-0.5"
        >
          <Avatar className="size-6">
            <AvatarFallback
              className="overflow-hidden"
              style={{
                background: 'white',
              }}
            >
              <img src={smileySrc} alt="agent" className="w-4 h-4 object-contain" />
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-green-400 mb-1">
            Execution Complete
          </div>
          <div className="text-sm text-gray-300 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FinalResultItem