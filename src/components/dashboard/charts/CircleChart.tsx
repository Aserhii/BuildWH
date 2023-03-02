import React, { type FC } from "react"
import { formatLong } from "../data"

interface Props {
  data: {
    value: number
    color: string
    description: string
  }[]
  displayValue: number
  unitOfMeasurement: string
}

const CircleChart: FC<Props> = (props) => {
  const w = 60
  const h = 60

  const r1 = 20
  const r2 = 30

  const total = props.data.reduce((accumulator, v) => accumulator + v.value, 0)

  if (props.data.length === 0) {
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

  let baseline = r1

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      {props.data.map((d) => {
        const currentBaseline = baseline
        const strokeWidth = (d.value / total) * (r2 - r1)
        const r = currentBaseline + strokeWidth / 2
        baseline += strokeWidth
        return (
          <circle
            cx={w / 2}
            cy={h / 2}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
          />
        )
      })}
      <text
        x={w / 2}
        y={h / 2}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 8 }}
      >
        {formatLong(props.displayValue)}
      </text>
      <text
        x={w / 2}
        y={h / 2 + 7}
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
