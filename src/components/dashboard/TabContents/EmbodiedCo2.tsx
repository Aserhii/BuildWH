import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const EmbodiedCo2: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props
  return (
    <DataTable
      data={[
        {
          label: "Foundations embodied CO₂",
          value: dashboardData.embodiedCo2.foundations,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Modules embodied CO₂",
          value: dashboardData.embodiedCo2.modules,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Roof covering embodied CO₂",
          value: dashboardData.embodiedCo2.roofing,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Internal lining embodied CO₂",
          value: dashboardData.embodiedCo2.internalLining,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Cladding embodied CO₂",
          value: dashboardData.embodiedCo2.cladding,
          unitOfMeasurement: "kgCO₂",
        },
        {
          label: "Embodied CO₂ total",
          value: dashboardData.embodiedCo2.total,
          unitOfMeasurement: "kgCO₂",
        },
      ]}
    />
  )
}

export default EmbodiedCo2
