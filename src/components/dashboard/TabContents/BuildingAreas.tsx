import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const BuildingAreas: FC<{ dashboardData: DashboardData }> = (props) => {
  const {
    dashboardData: { areas },
  } = props

  return (
    <DataTable
      data={[
        {
          label: "Footprint area",
          value: areas.foundation,
          unitOfMeasurement: "m²",
        },
        {
          label: "Ground floor area",
          value: areas.groundFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "First floor area",
          value: areas.firstFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "Second floor area",
          value: areas.secondFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "Bedroom areas",
          value: areas.bedroom,
          unitOfMeasurement: "m²",
        },
        {
          label: "Bathroom areas",
          value: areas.bathroom,
          unitOfMeasurement: "m²",
        },
        {
          label: "Living areas",
          value: areas.living,
          unitOfMeasurement: "m²",
        },
        {
          label: "Kitchen areas",
          value: areas.kitchen,
          unitOfMeasurement: "m²",
        },
        {
          label: "Cladding",
          value: areas.cladding,
          unitOfMeasurement: "m²",
        },
        {
          label: "Internal lining",
          value: areas.internalLining,
          unitOfMeasurement: "m²",
        },
        {
          label: "Roofing",
          value: areas.roofing,
          unitOfMeasurement: "m²",
        },
        {
          label: "Glazing/opening areas",
          value: areas.windowsAndDoors,
          unitOfMeasurement: "m²",
        },
      ]}
    />
  )
}

export default BuildingAreas
