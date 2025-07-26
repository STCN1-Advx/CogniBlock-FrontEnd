'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * 页面过渡动画组件
 * 实现旧页面先退出一半，然后切换内容，新页面再进入的效果
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (displayedChildren !== children) {
      setIsTransitioning(true)
      // 在动画播放一半时切换内容
      const timer = setTimeout(() => {
        setDisplayedChildren(children)
        setIsTransitioning(false)
      }, 200) // 0.4s动画的一半

      return () => clearTimeout(timer)
    }
  }, [children, displayedChildren])

  const variants = {
    initial: {
      opacity: 0,
      x: 100,
    },
    enter: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -100,
    },
  }

  const transition = {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  }

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate={isTransitioning ? "exit" : "enter"}
      variants={variants}
      transition={transition}
      className="w-full h-full"
    >
      {displayedChildren}
    </motion.div>
  )
}