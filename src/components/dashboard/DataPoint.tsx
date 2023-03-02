import React, { type FC } from "react"

const DataPoint: FC<{
  label: string
  value: number
  unitOfMeasurement: string
  explanation: string
}> = (props) => (
  <div className="space-y-4">
    <p className="text-sm">{props.label}</p>
    <div>
      <p className="text-4xl text-gray-400">{`${props.value}${props.unitOfMeasurement}`}</p>
      <p className="text-sm text-gray-400">{props.explanation}</p>
    </div>
  </div>
)

export default DataPoint
