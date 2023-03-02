import React, { type FC } from "react"

interface Props {
  data: {
    label: string
    description: string
    value: number
    unitOfMeasurement: string
  }[]
}

const DataTable: FC<Props> = (props) => {
  return (
    <div className="table w-full">
      {props.data.map((row, rowIndex) => (
        <div key={rowIndex} className="table-row bg-white">
          <div className={"table-cell px-4 py-2"}>{row.label}</div>
          <div className={"table-cell px-4 py-2 italic"}>{row.description}</div>
          <div className={"table-cell px-4 py-2"}>{row.value}</div>
          <div className={"table-cell px-4 py-2"}>{row.unitOfMeasurement}</div>
        </div>
      ))}
    </div>
  )
}

export default DataTable
