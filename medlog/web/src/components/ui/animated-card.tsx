'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  scale?: boolean
  delay?: number
  onClick?: () => void
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  scale = false,
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { 
        y: -4,
        scale: scale ? 1.02 : 1,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      } : undefined}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-shadow",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedStatCard({
  title,
  value,
  change,
  icon: Icon,
  delay = 0,
}: {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon: React.ElementType
  delay?: number
}) {
  return (
    <AnimatedCard delay={delay} className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {change.isPositive ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500 text-sm font-medium"
                >
                  ↑ {change.value}%
                </motion.span>
              ) : (
                <span className="text-red-500 text-sm font-medium">
                  ↓ {Math.abs(change.value)}%
                </span>
              )}
              <span className="text-gray-500 text-sm">vs last month</span>
            </div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <Icon className="w-6 h-6 text-blue-500" />
        </motion.div>
      </div>
    </AnimatedCard>
  )
}

export function AnimatedList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-2", className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export function AnimatedProgressBar({
  value,
  max = 100,
  showLabel = true,
  color = "blue",
}: {
  value: number
  max?: number
  showLabel?: boolean
  color?: "blue" | "green" | "red" | "yellow" | "purple"
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
          </>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-2.5 rounded-full", colorClasses[color])}
        />
      </div>
    </div>
  )
}

export function AnimatedCounter({
  value,
  duration = 1,
  prefix = "",
  suffix = "",
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / (duration * 1000), 1)
      
      setCount(Math.floor(value * percentage))

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <span className="font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export function AnimatedTab({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-md transition-colors",
            activeTab === tab
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  )
}
