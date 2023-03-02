import React, { type FC } from "react"
import { colorScheme } from "../Ui"
import { formatWithUnit } from "../data"

interface Props {
  data: number[]
  unitOfMeasurement: string
}

const CircleChart: FC<Props> = (props) => {
  const w = 60
  const h = 80

  const total = props.data.reduce((a, b) => a + b, 0)

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      {props.data.map((d, index) => {
        return (
          <circle
            key={index}
            cx={w / 2}
            cy={h / 2}
            r={25}
            fill="none"
            stroke={colorScheme[0]}
            strokeWidth="5"
          />
        )
      })}
      <text
        x={w / 2}
        y={h / 2 + 4}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 10 }}
      >
        {formatWithUnit(props.data[0] || 0, props.unitOfMeasurement)}
      </text>
    </svg>
  )
}

export default CircleChart
