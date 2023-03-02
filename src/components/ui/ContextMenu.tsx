import React, { useRef } from "react"
import type { ReactNode } from "react"
import { useClickAway, useEscape } from "./utils"

export type ContextMenuProps = {
  pageX: number
  pageY: number
  onClose?: () => void
  children?: ReactNode
}

export default function ContextMenu(props: ContextMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useClickAway(containerRef, props.onClose)

  useEscape(props.onClose)

  return (
    <div
      className="absolute h-[1px] w-[1px]"
      style={{
        top: props.pageY,
        left: props.pageX,
      }}
    >
      <div
        ref={containerRef}
        className={`absolute z-20 w-48 bg-white shadow-lg ${
          props.pageY > 300 ? "bottom-[2px]" : "top-[2px]"
        }`}
      >
        {props.children}
      </div>
    </div>
  )
}
