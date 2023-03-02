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
          description: "total foundation area",
          value: areas.foundation,
          unitOfMeasurement: "m²",
        },
        {
          label: "Ground floor area",
          description: "",
          value: areas.groundFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "First floor area",
          description: "",
          value: areas.firstFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "Second floor area",
          description: "",
          value: areas.secondFloor,
          unitOfMeasurement: "m²",
        },
        {
          label: "Bedroom areas",
          description: "",
          value: areas.bedroom,
          unitOfMeasurement: "m²",
        },
        {
          label: "Bathroom areas",
          description: "",
          value: areas.bathroom,
          unitOfMeasurement: "m²",
        },
        {
          label: "Living areas",
          description: "",
          value: areas.living,
          unitOfMeasurement: "m²",
        },
        {
          label: "Kitchen areas",
          description: "",
          value: areas.kitchen,
          unitOfMeasurement: "m²",
        },
        // TODO: calculate
        {
          label: "Stair areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Cladding",
          description: "",
          value: areas.cladding,
          unitOfMeasurement: "m²",
        },
        {
          label: "Internal lining",
          description: "",
          value: areas.internalLining,
          unitOfMeasurement: "m²",
        },
        {
          label: "Roofing",
          description: "",
          value: areas.roofing,
          unitOfMeasurement: "m²",
        },
        {
          label: "Glazing/opening areas",
          description: "",
          value: areas.windowsAndDoors,
          unitOfMeasurement: "m²",
        },
      ]}
    />
  )
}

export default BuildingAreas
