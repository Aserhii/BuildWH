import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const BuildCosts: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { costs },
  } = props
  return (
    <DataTable
      data={[
        {
          label: "Foundation cost",
          value: costs.foundation,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof structure cost",
          value: costs.roofStructure,
          unitOfMeasurement: "€",
        },
        {
          label: "Superstructure cost",
          value: costs.superstructure,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof covering cost",
          value: costs.roofing,
          unitOfMeasurement: "€",
        },
        {
          label: "Internal lining cost",
          value: costs.internalLining,
          unitOfMeasurement: "€",
        },
        {
          label: "Cladding cost",
          value: costs.cladding,
          unitOfMeasurement: "€",
        },
        {
          label: "Total build cost",
          value: costs.total,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default BuildCosts
