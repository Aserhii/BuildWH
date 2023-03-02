import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const OperationalCo2: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { operationalCo2 },
  } = props

  return (
    <DataTable
      data={[
        {
          label: "Annual operational CO₂ total",
          description: "",
          value: operationalCo2.annualTotal,
          unitOfMeasurement: "kgCO₂e",
        },
        {
          label: "Annual operational CO₂ comparative",
          description: "",
          value: operationalCo2.annualComparative,
          unitOfMeasurement: "kgCO₂e",
        },
        {
          label: "Operational CO₂ lifetime",
          description: "",
          value: operationalCo2.lifetime,
          unitOfMeasurement: "kgCO₂e",
        },
      ]}
    />
  )
}

export default OperationalCo2
