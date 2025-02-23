"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const updateMousePosition = (ev: MouseEvent) => {
      if (!containerRef.current) return
      const { clientX, clientY } = ev
      const { width, height, left, top } = containerRef.current.getBoundingClientRect()
      const x = (clientX - left) / width
      const y = (clientY - top) / height
      containerRef.current.style.setProperty("--mouse-x", `${x}`)
      containerRef.current.style.setProperty("--mouse-y", `${y}`)
    }

    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,0.5)_var(--mouse-y,0.5),rgba(var(--secondary-rgb),0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5" />

      <Shapes />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
    </div>
  )
}

function Shapes() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={cn(
          "absolute left-[10%] top-[20%] h-32 w-32 rounded-full",
          "bg-gradient-to-br from-primary/20 to-transparent",
          "animate-float",
          "blur-xl",
        )}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className={cn(
          "absolute right-[10%] top-[60%] h-48 w-48 rounded-full",
          "bg-gradient-to-br from-secondary/20 to-transparent",
          "animate-float [animation-delay:2s]",
          "blur-xl",
        )}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className={cn(
          "absolute left-[20%] bottom-[20%] h-24 w-24 rounded-full",
          "bg-gradient-to-br from-accent/20 to-transparent",
          "animate-float [animation-delay:4s]",
          "blur-xl",
        )}
      />
    </>
  )
}

