import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const BuildingFabric: FC<{ dashboardData: DashboardData }> = () => {
  return (
    <DataTable
      data={[
        {
          label: "Glazing u-value",
          description: "",
          value: 0,
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Floor u-value",
          description: "",
          value: 0,
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Wall u-value",
          description: "",
          value: 0,
          unitOfMeasurement: "W/m²K",
        },
        {
          label: "Roof u-value",
          description: "",
          value: 0,
          unitOfMeasurement: "W/m²K",
        },
      ]}
    />
  )
}

export default BuildingFabric
