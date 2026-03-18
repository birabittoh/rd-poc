import React, { useEffect, useRef, useContext, useId } from 'react'
import { motion } from 'motion/react'
import { ItemDefinition } from '../types'
import { PreviewContext } from './ScrollContainer'

interface VariantPreviewProps {
  item: ItemDefinition
  variant?: number
  isSelected?: boolean
  onClick?: () => void
  label?: string
}

export function VariantPreview({ item, variant, isSelected, onClick, label }: VariantPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const context = useContext(PreviewContext)
  const id = useId()

  useEffect(() => {
    if (context && containerRef.current) {
      context.register({
        id,
        ref: containerRef,
        item,
        variant
      })
      return () => context.unregister(id)
    }
  }, [context, id, item, variant])

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all duration-200 group
        ${isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
          : 'border-white/5 bg-white/5 hover:border-white/20'
        }
      `}
    >
      <div
        ref={containerRef}
        className="absolute inset-1 pointer-events-none"
      />

      {isSelected && (
        <motion.div
          layoutId="active-variant"
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#111] z-30"
        />
      )}

      {label && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </span>
      )}
    </motion.button>
  )
}
