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
          description: "",
          value: costs.foundation,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof structure cost",
          description: "",
          value: costs.roofStructure,
          unitOfMeasurement: "€",
        },
        {
          label: "Superstructure cost",
          description: "",
          value: costs.superstructure,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof covering cost",
          description: "",
          value: costs.roofing,
          unitOfMeasurement: "€",
        },
        {
          label: "Internal lining cost",
          description: "",
          value: costs.internalLining,
          unitOfMeasurement: "€",
        },
        {
          label: "Cladding cost",
          description: "",
          value: costs.cladding,
          unitOfMeasurement: "€",
        },
        {
          label: "Total build cost",
          description: "",
          value: costs.total,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default BuildCosts
