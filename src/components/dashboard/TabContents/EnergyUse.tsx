import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const EnergyUse: FC<{ dashboardData: DashboardData }> = () => {
  return (
    <DataTable
      data={[
        {
          label: "DHW demand",
          description: "",
          value: 0,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Space heading demand",
          description: "",
          value: 0,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Total heating demand",
          description: "",
          value: 0,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Primary energy demand",
          description: "",
          value: 0,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "DHW cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Space heading cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Total heating cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
        {
          label: "Primary energy cost",
          description: "",
          value: 0,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default EnergyUse
