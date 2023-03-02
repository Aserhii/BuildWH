import React, { type FC } from "react"
import { type DashboardData, type UValues } from "../data"
import DataTable from "../DataTable"

const BuildingFabric: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { byHouse, colorsByHouseId },
  } = props

  const uValues = Object.entries(byHouse).map(([houseId, info]) => ({
    values: info.uValues,
    color: colorsByHouseId[houseId],
  }))

  const valueList = (fn: (uValues: UValues) => number) => (
    <p className="space-x-1">
      {uValues.map((d, index) => (
        <span
          key={index}
          className="rounded px-2 py-0.5 text-sm text-black"
          style={{
            backgroundColor: d.color,
          }}
        >
          {fn(d.values)}
        </span>
      ))}
    </p>
  )

  return (
    <DataTable
      data={[
        {
          label: "Glazing u-value",
          value: valueList((value) => value.glazingUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Floor u-value",
          value: valueList((value) => value.floorUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Wall u-value",
          value: valueList((value) => value.wallUValue),
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Roof u-value",
          value: valueList((value) => value.roofUValue),
          unitOfMeasurement: "W/m²K",
        },
      ]}
    />
  )
}

export default BuildingFabric
