import React, { type FC } from "react"
import { format } from "../data"

interface Props {
  value: number
  comparative: number
  unitOfMeasurement: string
}

const CircleChart: FC<Props> = (props) => {
  const w = 60
  const h = 60

  const t = 5

  const total = props.value + props.comparative

  if (props.value === 0 && props.comparative === 0) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="rgba(0,0,0,0.08)"></rect>
        <text
          x={w / 2}
          y={h / 2}
          fill="#fff"
          textAnchor="middle"
          style={{ fontSize: 3 }}
        >
          No data available
        </text>
      </svg>
    )
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      <circle
        cx={w / 2}
        cy={h / 2}
        r={w / 3 + t / 2 - (t * props.value) / total / 2}
        fill="none"
        stroke="#fff"
        strokeWidth={(t * props.value) / total}
      />
      <circle
        cx={w / 2}
        cy={h / 2}
        r={w / 3 - t / 2 + (t * props.comparative) / total / 2}
        fill="none"
        stroke="hsl(0,0%,70%)"
        strokeWidth={(5 * props.comparative) / total}
      />
      <text
        x={w / 2}
        y={h / 2}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 8 }}
      >
        {format(props.value)}
      </text>
      <text
        x={w / 2}
        y={h / 2 + 5}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 4 }}
      >
        {props.unitOfMeasurement}
      </text>
    </svg>
  )
}

export default CircleChart
