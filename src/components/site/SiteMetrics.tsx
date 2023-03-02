import { useHousesStats, useHouseStats } from "@/data/energyInfo"
import { useSiteContext, useSiteCurrency } from "@/stores/context"
import { useSiteAreaString } from "@/stores/map"
import React from "react"
import { InfoPanel } from "../ui"

const SiteInfoPanel = () => {
  const totalHouseStats = useHousesStats()

  const siteAreaString = useSiteAreaString()

  const { code: currencyCode, symbol: currencySymbol } = useSiteCurrency()

  return (
    <InfoPanel
      data={[
        {
          label: "Estimated build cost",
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
          }).format(totalHouseStats.cost),
        },
        {
          label: "Embodied Carbon",
          value: `${(totalHouseStats.embodiedCarbon / 1000).toFixed(2)} tCO₂e`,
        },
        {
          label: "Space Heating Demand",
          value: `${totalHouseStats.totalHeatingDemand} kWh/yr`,
        },
        {
          label: "Operational CO₂",
          value: `${totalHouseStats.operationalCo2} tCO₂/yr`,
        },
        {
          label: "Estimated Heating Costs",
          value: `${currencySymbol}${totalHouseStats.estimatedHeatingCosts}/yr`,
        },
        ...(siteAreaString !== null
          ? [
              {
                label: "Site Area",
                value: siteAreaString,
              },
            ]
          : []),
      ]}
    />
  )
}

const BuildingInfoPanel = ({ buildingId }: { buildingId: string }) => {
  const houseStats = useHouseStats(buildingId)

  const { code: currencyCode, symbol: currencySymbol } = useSiteCurrency()

  return (
    <InfoPanel
      data={[
        {
          label: "Estimated build cost",
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
          }).format(houseStats.cost),
        },
        {
          label: "Embodied Carbon",
          value: `${(houseStats.embodiedCarbon / 1000).toFixed(2)} tCO₂e`,
        },
        {
          label: "Space Heating Demand",
          value: `${houseStats.totalHeatingDemand} kWh/yr`,
        },
        {
          label: "Operational CO₂",
          value: `${houseStats.operationalCo2} tCO₂/yr`,
        },
        {
          label: "Estimated Heating Costs",
          value: `${currencySymbol}${houseStats.estimatedHeatingCosts}/yr`,
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
