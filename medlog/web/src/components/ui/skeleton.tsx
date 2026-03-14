'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      animate={{
        background: [
          'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn('bg-gray-200 dark:bg-gray-700 rounded animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
