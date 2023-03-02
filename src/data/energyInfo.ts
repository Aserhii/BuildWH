import calculate from "@/components/dashboard/data"
import { useSystemsData } from "@/contexts/SystemsData"
import type { System } from "@/data/system"
import houses from "@/stores/houses"
import { find } from "ramda"
import { Element } from "./element"
import type { House } from "./house"
import type { HouseType } from "./houseType"
import { Material } from "./material"
import type { Module } from "./module"
import { moduleLayout } from "./moduleLayout"
import { getAirtableEntries } from "./utils"

export interface EnergyInfo {
  systemId: string
  dhwDemand: number // kWh/m2/yr
  spaceHeatingDemand: number // kWh/m2/yr
  totalHeatingDemand: number // kWh/m2/yr
  freshAirRequirement: number // m3
  operationalCo2: number // kg/m2/yr
  primaryEnergyDemand: number // kWh/m2/yr
  generationEnergy: number // kWh/m2/yr
  electricityTariff: number // EUR
  glazingUValue: number
  wallUValue: number
  floorUValue: number
  roofUValue: number
}

const getEnergyEntry = (fieldName: string, records: Array<any>): number => {
  return (
    find((record) => record.fields["Field"] === fieldName, records)?.fields[
      "SWC_constants"
    ] || 0
  )
}

export const getEnergyInfo = async (system: System): Promise<EnergyInfo> => {
  try {
    const records: Array<any> = (
      await getAirtableEntries({
        tableId: system.airtableId,
        tab: "energy_calculator",
      })
    ).records
    return {
      systemId: system.id,
      dhwDemand: getEnergyEntry("DHW demand", records),
      spaceHeatingDemand: getEnergyEntry("Space Heating Demand", records),
      totalHeatingDemand: getEnergyEntry("Total Heating Demand", records),
      freshAirRequirement: getEnergyEntry("Fresh Air Requirment", records),
      operationalCo2: getEnergyEntry("Operational Co2", records),
      primaryEnergyDemand: getEnergyEntry("Primary Energy Demand ", records),
      generationEnergy: getEnergyEntry("Generation Energy", records),
      electricityTariff: getEnergyEntry("Electricity tariff", records),
      glazingUValue: getEnergyEntry("Glazing u-value", records),
      wallUValue: getEnergyEntry("Wall u-value", records),
      floorUValue: getEnergyEntry("Floor u-value", records),
      roofUValue: getEnergyEntry("Roof u-value", records),
    }
  } catch (err) {
    console.warn(err)
    return {
      systemId: system.id,
      dhwDemand: 0,
      spaceHeatingDemand: 0,
      totalHeatingDemand: 0,
      freshAirRequirement: 0,
      operationalCo2: 0,
      primaryEnergyDemand: 0,
      generationEnergy: 0,
      electricityTariff: 0,
      glazingUValue: 0,
      wallUValue: 0,
      floorUValue: 0,
      roofUValue: 0,
    }
  }
}

export interface HouseStats {
  cost: number
  embodiedCarbon: number
  totalHeatingDemand: number
  operationalCo2: number
  estimatedHeatingCosts: number
}

const noHouseStats: HouseStats = {
  cost: 0,
  embodiedCarbon: 0,
  totalHeatingDemand: 0,
  operationalCo2: 0,
  estimatedHeatingCosts: 0,
}

export const sumHouseStats = (houseStats: Array<HouseStats>) => {
  return houseStats.reduce(
    (accumulator, current) => ({
      cost: accumulator.cost + current.cost,
      embodiedCarbon: accumulator.embodiedCarbon + current.embodiedCarbon,
      totalHeatingDemand:
        accumulator.totalHeatingDemand + current.totalHeatingDemand,
      operationalCo2: accumulator.operationalCo2 + current.operationalCo2,
      estimatedHeatingCosts:
        accumulator.estimatedHeatingCosts + current.estimatedHeatingCosts,
    }),
    noHouseStats
  )
}

export const getHouseStats = ({
  house,
  modules,
  houseTypes,
  energyInfo,
  elements,
  materials,
}: {
  house: House
  modules: Array<Module>
  houseTypes: Array<HouseType>
  energyInfo: Array<EnergyInfo>
  elements: Element[]
  materials: Material[]
}): HouseStats => {
  const relevantEnergyInfo = find(
    (info) => info.systemId === house.systemId,
    energyInfo
  )
  if (!relevantEnergyInfo) {
    return noHouseStats
  }

  const houseModules: Array<Module> = house.dna
    .map((sequence) =>
      find(
        (module) =>
          module.systemId === house.systemId && module.dna === sequence,
        modules
      )
    )
    .filter((m): m is Module => Boolean(m))

  const layout = moduleLayout(houseModules)

  const surface = layout.cellWidths.reduce((runningTotal, width, index) => {
    return runningTotal + width * (layout.cellLengths[index] || 0)
  }, 0)

  const systemsData = useSystemsData()

  const {
    costs: { total: cost },
    embodiedCo2: { total: embodiedCarbon },
  } = calculate({ houses, systemsData })

  return {
    cost,
    embodiedCarbon,
    totalHeatingDemand: Math.round(
      relevantEnergyInfo.totalHeatingDemand * surface
    ),
    operationalCo2: Math.round(relevantEnergyInfo.operationalCo2 * surface),
    estimatedHeatingCosts: Math.round(
      relevantEnergyInfo.totalHeatingDemand *
        surface *
        relevantEnergyInfo.electricityTariff
    ),
  }
}
