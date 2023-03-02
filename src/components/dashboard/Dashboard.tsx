import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import { Close } from "@/components/ui/icons"
import React, { useMemo, useState, type FC } from "react"
import Link from "next/link"
import BasicChart from "./BasicChart"
import DataPoint from "./DataPoint"
import { type Module } from "@/data/module"
import { Tab, tabs, fromSlug } from "./dashboardTabs"

export interface Props {
  slug?: string
}

const Overview = () => {
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-4 space-x-4">
        <DataPoint
          label="Total site area"
          value={350}
          unitOfMeasurement="m²"
          explanation="gross internal area"
        />
        <DataPoint
          label="Total building area"
          value={350}
          unitOfMeasurement="m²"
          explanation="gross internal area"
        />
        <DataPoint
          label="Number of units"
          value={2}
          unitOfMeasurement=""
          explanation="new buildings"
        />
      </div>
      <div className="grid grid-cols-4 space-x-4">
        <BasicChart
          label="Estimated total building cost"
          data={[10, 20]}
          explanation="gross internal area"
        />
        <BasicChart
          label="Annual energy demand"
          data={[-2, 8]}
          explanation="gross internal area"
        />
        <BasicChart
          label="Total operational CO₂"
          data={[4, 1]}
          explanation="gross internal area"
        />
        <BasicChart
          label="Total embodied CO₂"
          data={[4, 1]}
          explanation="gross internal area"
        />
      </div>
    </div>
  )
}

const Dashboard: FC<Props> = (props) => {
  const houses = useHouses()
  const systemsData = useSystemsData()
  const activeTab = fromSlug(props.slug)

  const [selectedHouses, setSelectedHouses] = useState<string[]>(
    Object.keys(houses).slice(0, 1)
  )

  // TODO: extract into @/stores/houses.ts once finalized
  const modulesByHouse = useMemo(() => {
    const obj: Record<string, Module[]> = {}
    if (!systemsData || systemsData === "error") {
      return
    }
    selectedHouses.forEach((houseId) => {
      const house = houses[houseId]
      if (!house) {
        return
      }
      obj[houseId] = house.dna
        .map((dna) =>
          systemsData.modules.find(
            (module) => module.dna === dna && module.systemId === house.systemId
          )
        )
        .filter((module): module is Module => Boolean(module))
    })
    return obj
  }, [systemsData, selectedHouses])

  return (
    <div className="w-full h-full overflow-auto bg-gray-100">
      <div className="max-w-5xl pt-20 pb-16 mx-auto space-y-8">
        <div className="flex py-4 border-b border-gray-700 space-x-2">
          <input
            list="buildings"
            className="w-40 px-2 py-1 list-none"
            value=""
            placeholder="Add house"
            onChange={(ev) => {
              const foundHouse = Object.entries(houses).find(
                ([_houseId, house]) => house.friendlyName === ev.target.value
              )
              const houseId = foundHouse?.[0]
              if (!houseId) {
                return null
              }
              setSelectedHouses((prev) => [...prev, houseId])
            }}
          />
          <datalist id="buildings">
            {Object.entries(houses).map(([houseId, house]) =>
              selectedHouses.includes(houseId) ? null : (
                <option key={houseId} value={house.friendlyName} />
              )
            )}
          </datalist>
          {selectedHouses.map((houseId) => {
            const house = houses[houseId]
            if (!house) {
              return null
            }
            return (
              <p
                key={houseId}
                className="inline-flex items-center bg-white space-x-1"
              >
                <span className="inline-block py-1 pl-3">
                  {house.friendlyName}
                </span>
                <button
                  className="h-8 w-8 p-0.5 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedHouses((prev) =>
                      prev.filter((id) => id !== houseId)
                    )
                  }}
                >
                  <Close />
                </button>
              </p>
            )
          })}
        </div>
        <div className="flex items-center justify-start space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Link key={tab.id} href={`/dashboard/${tab.id}`}>
                <span
                  className={[
                    "inline-block cursor-pointer whitespace-pre px-2 py-1 font-bold",
                    isActive ? "text-gray-700" : "text-gray-300",
                  ].join(" ")}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
        <div className="pt-8">
          {activeTab === Tab.Overview ? <Overview /> : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
