import React, { useMemo, type FC } from "react"

const BasicChart: FC<{
  label: string
  data: number[]
  explanation: string
}> = (props) => {
  const { max, min } = useMemo(
    () => ({
      max: Math.max(...props.data),
      min: Math.min(...props.data),
    }),
    [props.data]
  )

  const w = 60
  const h = 100

  const baseline = min < 0 ? h / 2 : h

  const scale = (min < 0 ? h / 2 : h) * 0.85

  return (
    <div className="space-y-4">
      <p className="text-sm">{props.label}</p>
      <div className="space-y-2">
        <svg width="200" viewBox={`0 0 ${w} ${h}`}>
          {props.data.map((point, index) => {
            const width = (w / (props.data.length + 1)) * 0.6
            const height = (point * scale) / max
            const x = (w * (index + 1)) / (props.data.length + 1) - width / 2
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={baseline - Math.max(height, 0)}
                  width={width}
                  height={Math.abs(height)}
                  stroke="none"
                  fill={index === 0 ? "#3EFF80" : "#9D9D9D"}
                />
                <text
                  x={x + width / 2}
                  y={baseline - height - (height < 0 ? -6 : 3)}
                  fill="#9D9D9D"
                  textAnchor="middle"
                  style={{ fontSize: 4 }}
                >
                  {point}
                </text>
              </g>
            )
          })}
          <line
            x1="0"
            y1={baseline - 0.25}
            x2={w}
            y2={baseline - 0.25}
            stroke="#000"
            strokeWidth="0.5"
          />
        </svg>
        <p className="text-sm text-gray-400">{props.explanation}</p>
      </div>
    </div>
  )
}

export default BasicChart
