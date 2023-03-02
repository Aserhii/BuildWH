import type { BuildSystem } from "@/data/buildSystem"
import { find } from "ramda"
import type { House } from "./house"
import type { HouseType } from "./houseType"
import type { Module } from "./module"
import { moduleLayout } from "./moduleLayout"
import { getAirtableEntries } from "./utils"

export interface EnergyInfo {
  systemId: string
  dhwDemand: number // kWh/m2/yr
  spaceHeatingDemand: number // kWh/m2/yr
  totalHeadingDemand: number // kWh/m2/yr
  freshAirRequirement: number // m3
  operationalCo2: number // kg/m2/yr
  primaryEnergyDemand: number // kWh/m2/yr
  generationEnergy: number // kWh/m2/yr
  electricityTariff: number // EUR
}

const getEnergyEntry = (fieldName: string, records: Array<any>): number => {
  return (
    find((record) => record.fields["Field"] === fieldName, records)?.fields[
      "SWC_constants"
    ] || 0
  )
}

export const getEnergyInfo = async (
  system: BuildSystem
): Promise<EnergyInfo> => {
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
      totalHeadingDemand: getEnergyEntry("Total Heating Demand", records),
      freshAirRequirement: getEnergyEntry("Fresh Air Requirment", records),
      operationalCo2: getEnergyEntry("Operational Co2", records),
      primaryEnergyDemand: getEnergyEntry("Primary Energy Demand ", records),
      generationEnergy: getEnergyEntry("Generation Energy", records),
      electricityTariff: getEnergyEntry("Electricity tariff", records),
    }
  } catch (err) {
    console.warn(err)
    return {
      systemId: system.id,
      dhwDemand: 0,
      spaceHeatingDemand: 0,
      totalHeadingDemand: 0,
      freshAirRequirement: 0,
      operationalCo2: 0,
      primaryEnergyDemand: 0,
      generationEnergy: 0,
      electricityTariff: 0,
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
}: {
  house: House
  modules: Array<Module>
  houseTypes: Array<HouseType>
  energyInfo: Array<EnergyInfo>
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

  return {
    cost: houseModules.reduce(
      (accumulator, module) => accumulator + module.cost,
      0
    ),
    embodiedCarbon: houseModules.reduce(
      (accumulator, module) => accumulator + module.embodiedCarbon,
      0
    ),
    totalHeatingDemand: Math.round(
      relevantEnergyInfo.totalHeadingDemand * surface
    ),
    operationalCo2: Math.round(relevantEnergyInfo.operationalCo2 * surface),
    estimatedHeatingCosts: Math.round(
      relevantEnergyInfo.totalHeadingDemand *
        surface *
        relevantEnergyInfo.electricityTariff
    ),
  }
}
