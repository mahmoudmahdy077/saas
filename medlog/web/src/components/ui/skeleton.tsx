'use client'

import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-gray-200 dark:bg-gray-700 rounded animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
