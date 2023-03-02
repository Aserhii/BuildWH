import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React, { useEffect, useMemo, useState, type FC } from "react"
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
import JSZip from "jszip"

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

  const [zipUrl, setZipUrl] = useState<string>("")

  useEffect(() => {
    if (!dashboardData) {
      return
    }
    const zip = new JSZip()
    const houses = zip.folder("houses")

    Object.entries(dashboardData.byHouse).forEach(([houseId, info]) => {
      const data = info.houseModules.map((module) => ({
        dna: module.dna,
        width: module.width,
        height: module.height,
      }))
      houses?.file(
        `${houseId}.csv`,
        `"Code","Width","Height"\n${data
          .map((d) => `"${d.dna}","${d.width}","${d.height}"`)
          .join("\n")}`
      )
    })

    zip.generateAsync({ type: "base64" }).then((b64) => {
      const url = `data:application/zip;base64,${b64}`
      setZipUrl(url)
    })
  }, [dashboardData, setZipUrl])

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
        <div className="p-2">
          <a className="text-xs underline" href={zipUrl}>
            Download
          </a>
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
