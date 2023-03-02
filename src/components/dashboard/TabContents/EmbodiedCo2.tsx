import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const EmbodiedCo2: FC<{ dashboardData: DashboardData }> = () => {
  return (
    <DataTable
      data={[
        {
          label: "Foundations embodied CO₂",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Modules embodied CO₂",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Cladding embodied CO₂",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Embodied CO₂ total",
          description: "",
          value: 0,
          unitOfMeasurement: "kgCO₂",
        },
      ]}
    />
  )
}

export default EmbodiedCo2
