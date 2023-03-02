import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const EnergyUse: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { energyUse },
  } = props

  return (
    <DataTable
      data={[
        {
          label: "DHW demand",
          description: "",
          value: energyUse.dhwDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Space heating demand",
          description: "",
          value: energyUse.spaceHeatingDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Total heating demand",
          description: "",
          value: energyUse.totalHeatingDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Primary energy demand",
          description: "",
          value: energyUse.primaryEnergyDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "DHW cost",
          description: "",
          value: energyUse.dhwCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Space heading cost",
          description: "",
          value: energyUse.spaceHeatingCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Total heating cost",
          description: "",
          value: energyUse.totalHeatingCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Primary energy cost",
          description: "",
          value: energyUse.primaryEnergyCost,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default EnergyUse
