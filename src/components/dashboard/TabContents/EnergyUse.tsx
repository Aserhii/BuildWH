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
          value: energyUse.dhwDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Space heating demand",
          value: energyUse.spaceHeatingDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Total heating demand",
          value: energyUse.totalHeatingDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "Primary energy demand",
          value: energyUse.primaryEnergyDemand,
          unitOfMeasurement: "kWh/year",
        },
        {
          label: "DHW cost",
          value: energyUse.dhwCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Space heading cost",
          value: energyUse.spaceHeatingCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Total heating cost",
          value: energyUse.totalHeatingCost,
          unitOfMeasurement: "€",
        },
        {
          label: "Primary energy cost",
          value: energyUse.primaryEnergyCost,
          unitOfMeasurement: "€",
        },
      ]}
    />
  )
}

export default EnergyUse
