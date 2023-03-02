import React, { type FC } from "react"
import { type DashboardData } from "../data"
import DataTable from "../DataTable"

const BuildingAreas: FC<{ dashboardData: DashboardData }> = (props) => {
  const { areas } = props.dashboardData

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
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Bathroom areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Living areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Kitchen areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Stair areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Cladding",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Internal lining",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Roofing",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
        {
          label: "Glazing/opening areas",
          description: "",
          value: 0,
          unitOfMeasurement: "m²",
        },
      ]}
    />
  )
}

export default BuildingAreas
