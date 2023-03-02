import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React, { useMemo, useState, type FC } from "react"
import Link from "next/link"
import Loader from "@/components/ui/Loader"
import calculate, { type DashboardData } from "./data"
import HouseMultiSelect from "./HouseMultiSelect"
import { Tab, tabs, fromSlug } from "./dashboardTabs"
import { type House } from "@/data/house"
import Overview from "./TabContents/Overview"
import BuildingAreas from "./TabContents/BuildingAreas"
import BuildCosts from "./TabContents/BuildCosts"
import EnergyUse from "./TabContents/EnergyUse"
import BuildingFabric from "./TabContents/BuildingFabric"
import OperationalCo2 from "./TabContents/OperationalCo2"
import EmbodiedCo2 from "./TabContents/EmbodiedCo2"

export interface Props {
  slug?: string
}

const Dashboard: FC<Props> = (props) => {
  const houses = useHouses() as Record<string, House>
  const systemsData = useSystemsData()
  const activeTab = fromSlug(props.slug)

  // Select the first building by default
  const [selectedHouses, setSelectedHouses] = useState<string[]>(
    Object.keys(houses).slice(0, 1)
  )

  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!systemsData || systemsData === "error") {
      return null
    }
    return calculate({
      houses,
      systemsData,
      selectedHouses,
    })
  }, [systemsData, houses, selectedHouses])

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <Loader />
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-600">
      <div className="pt-16 pb-16 mx-auto">
        <div>
          <HouseMultiSelect
            houses={houses}
            selectedHouses={selectedHouses}
            setSelectedHouses={setSelectedHouses}
          />
          <div className="flex flex-wrap items-center justify-start px-4 py-4 border-b border-gray-400 space-x-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <Link key={tab.id} href={`/dashboard/${tab.id}`}>
                  <span
                    className={[
                      "inline-block cursor-pointer whitespace-pre py-1 transition-colors duration-200",
                      isActive ? "text-white" : "text-gray-400 hover:text-gray-300",
                    ].join(" ")}
                  >
                    {tab.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
        <div>
          {activeTab === Tab.Overview ? (
            <Overview dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.BuildingAreas ? (
            <BuildingAreas dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.BuildCosts ? (
            <BuildCosts dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.EnergyUse ? (
            <EnergyUse dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.BuildingFabric ? (
            <BuildingFabric dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.OperationalCo2 ? (
            <OperationalCo2 dashboardData={dashboardData} />
          ) : null}
          {activeTab === Tab.EmbodiedCo2 ? (
            <EmbodiedCo2 dashboardData={dashboardData} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
