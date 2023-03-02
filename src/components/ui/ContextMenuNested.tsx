import type { ReactNode } from "react"
import React, { useState } from "react"
import useMeasure from "react-use-measure"
import { useWindowSize } from "usehooks-ts"

export interface Props {
  label: string
  children?: ReactNode
  long?: boolean
}

export default function ContextMenuNested(props: Props) {
  const [hovered, setHovered] = useState(false)

  const [ref, { top, right, bottom, width }] = useMeasure()

  const windowSize = useWindowSize()

  const flip = right > windowSize.width + width / 2

  const ty =
    top < 0 ? 0 : bottom > windowSize.height ? -(bottom - windowSize.height) : 0

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}
    >
      <div
        className={`py-2 px-3 text-left text-sm ${
          hovered ? "bg-gray-100" : ""
        }`}
      >
        {props.label}
      </div>
      {hovered ? (
        <div
          ref={ref}
          className={`absolute ${
            flip ? "right-full" : "left-full"
          } z-20 bg-white ${props.long ? "w-64" : "w-48"}`}
          style={{
            transform: `translate(${0}px, ${ty}px)`,
          }}
        >
          {props.children}
        </div>
      ) : null}
    </div>
  )
}
