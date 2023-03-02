import { getHouseStats, HouseStats, sumHouseStats } from "@/data/energyInfo"
import { useContext } from "@/stores/context"
import houses from "@/stores/houses"
import { mapRR } from "@/utils"
import { values } from "fp-ts-std/ReadonlyRecord"
import { pipe } from "fp-ts/lib/function"
import React from "react"
import { InfoPanel } from "../ui"
import { House } from "@/data/house"
import { useSystemsData } from "@/contexts/SystemsData"

const SiteInfoPanel = () => {
  const { modules, houseTypes, energyInfo } = useSystemsData()

  const totalHouseStats = pipe(
    houses,
    mapRR((house) =>
      getHouseStats({
        house: house as House,
        modules,
        houseTypes,
        energyInfo,
      })
    ),
    values,
    (stats) => sumHouseStats(stats as HouseStats[])
  )

  return (
    <InfoPanel
      data={[
        {
          label: "Estimated build cost",
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
          }).format(totalHouseStats.cost),
        },
        {
          label: "Total Carbon",
          value: `${totalHouseStats.embodiedCarbon} kgCO₂e`,
        },
        {
          label: "Total Heating Demand",
          value: `${totalHouseStats.totalHeatingDemand} kWh/yr`,
        },
        {
          label: "Operational CO₂",
          value: `${totalHouseStats.operationalCo2} kgCO₂/yr`,
        },
        {
          label: "Estimated Heating Costs",
          value: `${totalHouseStats.estimatedHeatingCosts} €/yr`,
        },
      ]}
    />
  )
}

const BuildingInfoPanel = ({ buildingId }: { buildingId: string }) => {
  const house = houses[buildingId]
  const { modules, houseTypes, energyInfo } = useSystemsData()

  const houseStats = pipe(
    house,
    (house) =>
      getHouseStats({
        house: house as House,
        modules,
        houseTypes,
        energyInfo,
      }),
    (stats) => sumHouseStats([stats] as HouseStats[])
  )

  return (
    <InfoPanel
      data={[
        {
          label: "Estimated build cost",
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
          }).format(houseStats.cost),
        },
        {
          label: "Total Carbon",
          value: `${houseStats.embodiedCarbon} kgCO₂e`,
        },
        {
          label: "Total Heating Demand",
          value: `${houseStats.totalHeatingDemand} kWh/yr`,
        },
        {
          label: "Operational CO₂",
          value: `${houseStats.operationalCo2} kgCO₂/yr`,
        },
        {
          label: "Estimated Heating Costs",
          value: `${houseStats.estimatedHeatingCosts} €/yr`,
        },
      ]}
    />
  )
}

const SiteMetrics = () => {
  const { buildingId } = useContext()

  switch (true) {
    case buildingId !== null:
      return <BuildingInfoPanel buildingId={buildingId!} />
    default:
      return <SiteInfoPanel />
  }
}

export default SiteMetrics
