import React, { type FC, type ReactNode } from "react"

interface Props {
  data: {
    label: string
    description: string
    value: number | ReactNode
    unitOfMeasurement: string
  }[]
}

const format = (no: number) => {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(no)
}

const DataTable: FC<Props> = (props) => {
  return (
    <div className="table w-full text-white border-separate space-y-1">
      {props.data.map((row, rowIndex) => (
        <div key={rowIndex} className="table-row bg-gray-500">
          <div className={"table-cell px-4 py-2"}>{row.label}</div>
          <div className={"table-cell px-4 py-2"}>
            {typeof row.value === "number" ? format(row.value) : row.value}
          </div>
          <div className={"table-cell px-4 py-2"}>{row.unitOfMeasurement}</div>
        </div>
      ))}
    </div>
  )
}

export default DataTable
