import React, { type FC, useState } from "react"
import { formatLong, formatWithUnitLong } from "../data"

interface DataPoint {
  value: number
  color: string
  description: string
}

interface Props {
  data: DataPoint[]
  displayValue: number
  unitOfMeasurement: string
}

const CircleChart: FC<Props> = (props) => {
  const w = 60
  const h = 60

  const r1 = 20
  const r2 = 30

  const [hovered, setHovered] = useState<number | null>(null)

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

  const tooltipContent = (dataPoint: DataPoint): string => {
    return `${dataPoint.description}: ${formatWithUnitLong(
      dataPoint.value,
      props.unitOfMeasurement
    )}`
  }

  // Accumulate a baseline radius to place elements next to each other while mapping over data
  let baseline = r1

  const hoveredDataPoint =
    typeof hovered === "number" ? props.data[hovered] : undefined

  return (
    <div className="relative">
      {hoveredDataPoint && (
        <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full transform  rounded bg-black px-1 py-0.5 text-center text-xs">
          {tooltipContent(hoveredDataPoint)}
        </p>
      )}
      <svg viewBox={`0 0 ${w} ${h}`}>
        {props.data.map((d, index) => {
          const currentBaseline = baseline
          const strokeWidth = (d.value / total) * (r2 - r1)
          const r = currentBaseline + strokeWidth / 2
          baseline += strokeWidth
          return (
            <circle
              key={index}
              cx={w / 2}
              cy={h / 2}
              onMouseEnter={() => {
                setHovered(index)
              }}
              onMouseLeave={() => {
                setHovered(null)
              }}
              r={r}
              fill="none"
              stroke={d.color}
              opacity={hovered === index ? "1" : "0.92"}
              strokeWidth={strokeWidth}
              className="transition-colors duration-100"
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
    </div>
  )
}

export default CircleChart
