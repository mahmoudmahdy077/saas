'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>
  fallback?: React.ReactNode
  props?: any
}

/**
 * Lazy load a component with automatic code splitting
 * Usage:
 * const LazyChart = LazyComponent({
 *   loader: () => import('@/components/ui/chart'),
 *   fallback: <ChartSkeleton />
 * })
 */
export function LazyComponent({ loader, fallback, props }: LazyComponentProps) {
  const Component = React.useMemo(() => lazy(loader), [loader])

  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-64" />}>
      <Component {...props} />
    </Suspense>
  )
}

/**
 * Preload a component for faster subsequent renders
 * Usage:
 * preloadComponent(() => import('@/components/ui/chart'))
 */
export function preloadComponent(loader: () => Promise<any>) {
  loader()
}

/**
 * Prefetch multiple components
 * Usage:
 * prefetchComponents([
 *   () => import('@/components/ui/chart'),
 *   () => import('@/components/ui/table'),
 * ])
 */
export function prefetchComponents(loaders: Array<() => Promise<any>>) {
  loaders.forEach(loader => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loader())
    } else {
      setTimeout(() => loader(), 1)
    }
  })
}

/**
 * Image lazy loader with intersection observer
 */
export function useLazyImage(src: string, rootMargin: string = '50px') {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    const element = document.getElementById(`lazy-img-${src}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [src, rootMargin])

  const handleLoad = () => {
    setHasLoaded(true)
  }

  return { isIntersecting, hasLoaded, handleLoad }
}

/**
 * Route-based code splitting helper
 * Usage in pages:
 * export default function Page() {
 *   return (
 *     <LazyRoute
 *       loader={() => import('@/components/heavy-component')}
 *       fallback={<PageSkeleton />}
 *     />
 *   )
 * }
 */
export function LazyRoute({
  loader,
  fallback,
}: {
  loader: () => Promise<{ default: React.ComponentType<any> }>
  fallback: React.ReactNode
}) {
  return <LazyComponent loader={loader} fallback={fallback} />
}

export default LazyComponent
