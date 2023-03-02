import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const BuildCosts: FC<{ dashboardData: DashboardData }> = () => {
  return (
    <DataTable
      data={[
        {
          label: "Foundation cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof structure cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Superstructure cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Roof covering cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Internal lining cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Cladding cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Total build cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default BuildCosts
