import { useSystemsData } from "@/contexts/SystemsData"
import { getHouseStats, HouseStats, sumHouseStats } from "@/data/energyInfo"
import { House } from "@/data/house"
import { useSiteContext } from "@/stores/context"
import houses from "@/stores/houses"
import { mapRR } from "@/utils"
import { values } from "fp-ts-std/ReadonlyRecord"
import { pipe } from "fp-ts/lib/function"
import React, { useMemo } from "react"
import { useSnapshot } from "valtio"
import { InfoPanel } from "../ui"

const SiteInfoPanel = () => {
  const { modules, houseTypes, energyInfo } = useSystemsData()

  const housesSnap = useSnapshot(houses)

  const totalHouseStats = pipe(
    housesSnap,
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
  const house = useSnapshot(houses?.[buildingId])
  const { modules, houseTypes, energyInfo } = useSystemsData()

  const houseStats = useMemo(
    () =>
      pipe(
        house,
        (house) =>
          getHouseStats({
            house: house as House,
            modules,
            houseTypes,
            energyInfo,
          }),
        (stats) => sumHouseStats([stats] as HouseStats[])
      ),
    [house.dna, house.modifiedMaterials]
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
  const { buildingId } = useSiteContext()

  switch (true) {
    case buildingId !== null:
      return <BuildingInfoPanel buildingId={buildingId!} />
    default:
      return <SiteInfoPanel />
  }
}

export default SiteMetrics
