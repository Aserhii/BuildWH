import React, { type FC } from "react"
import { formatWithUnit } from "../data"

interface Props {
  data: { value: number, color: string }[]
  unitOfMeasurement: string
}

const SquareChart: FC<Props> = (props) => {
  const w = 60
  const h = 60

  const total = props.data.reduce((accumulator, v) => accumulator + v.value, 0)

  if (total === 0) {
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

  // Start an accumulating y coordinate to stack bars on top of each other
  let accumulatedY = 0

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      {props.data.map((d, index) => {
        const currentAccummulatedY = accumulatedY
        const height = (d.value / total) * h
        accumulatedY += height
        return (
          <g transform={`translate(0 ${currentAccummulatedY})`} key={index}>
            <rect
              x="0"
              y={0}
              fill={d.color}
              width={w}
              height={height}
            />
            {d.value > total * 0.05 && (
              <text
                x={w / 2}
                y={height / 2 + 2}
                fill="#000"
                textAnchor="middle"
                style={{ fontSize: 3.5 }}
              >
                {formatWithUnit(d.value, props.unitOfMeasurement)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default SquareChart
