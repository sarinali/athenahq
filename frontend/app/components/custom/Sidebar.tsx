import React from 'react'
import GradientBorderView from '../ui/gradient-border-view'
import { Button } from '../ui/button'
import { XIcon } from 'lucide-react'

const Sidebar = () => {
  return <GradientBorderView className='m-2 rounded-2xl' contentClassName='w-[200px] h-full rounded-2xl'>
<div className='w-full flex justify-end'>
    <Button variant='ghost' size='icon'>    
        <XIcon className='w-4 h-4' />
    </Button>
</div>

  </GradientBorderView>
}

export default Sidebar