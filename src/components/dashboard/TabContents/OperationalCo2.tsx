import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const OperationalCo2: FC<{ dashboardData: DashboardData }> = () => {
  return (
    <DataTable
      data={[
        {
          label: "Annual operational CO₂ total",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂e",
        },
        {
          label: "Annual operational CO₂ comparative",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂e",
        },
        {
          label: "Operational CO₂ lifetime",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂e",
        },
      ]}
    />
  )
}

export default OperationalCo2
