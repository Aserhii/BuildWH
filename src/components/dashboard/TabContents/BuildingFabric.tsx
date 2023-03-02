import React, { type FC } from "react"
import { type DashboardData, type UValues } from "../data"
import DataTable from "../DataTable"
import { colorScheme } from "../Ui"

const BuildingFabric: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { byHouse },
  } = props

  const uValues = Object.entries(byHouse).map(
    ([_houseId, info]) => info.uValues
  )

  const valueList = (fn: (uValues: UValues) => number) => (
    <p className="space-x-1">
      {uValues.map((value, index) => (
        <span
          className="rounded px-2 py-0.5 text-sm text-black"
          style={{
            backgroundColor: colorScheme[index],
          }}
        >
          {fn(value)}
        </span>
      ))}
    </p>
  )

  return (
    <DataTable
      data={[
        {
          label: "Glazing u-value",
          description: "",
          value: valueList((value) => value.glazingUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Floor u-value",
          description: "",
          value: valueList((value) => value.floorUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Wall u-value",
          description: "",
          value: valueList((value) => value.wallUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Roof u-value",
          description: "",
          value: valueList((value) => value.roofUValue),
          unitOfMeasurement: "W/m²K",
        },
      ]}
    />
  )
}

export default BuildingFabric
