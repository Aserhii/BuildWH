import { type Module } from "@/data/module"
import { type SystemsData } from "@/data/system"
import { type House, type Houses } from "@/data/house"
import { type EnergyInfo } from "@/data/energyInfo"
import { type SpaceType } from "@/data/spaceType"
import { type WindowType } from "@/data/windowType"
import { type Element } from "@/data/element"
import { type Material } from "@/data/material"

export interface DashboardData {
  byHouse: Record<string, HouseInfo>
  unitsCount: number
  areas: Areas
  costs: Costs
  operationalCo2: OperationalCo2
  embodiedCo2: EmbodiedCo2
  energyUse: EnergyUse
}

// Areas

export interface Areas {
  totalFloor: number
  foundation: number
  groundFloor: number
  firstFloor: number
  secondFloor: number
  cladding: number
  internalLining: number
  roofing: number
  bedroom: number
  bathroom: number
  living: number
  kitchen: number
  windowsAndDoors: number
}

const emptyAreas = (): Areas => ({
  totalFloor: 0,
  foundation: 0,
  groundFloor: 0,
  firstFloor: 0,
  secondFloor: 0,
  cladding: 0,
  internalLining: 0,
  roofing: 0,
  bedroom: 0,
  bathroom: 0,
  living: 0,
  kitchen: 0,
  windowsAndDoors: 0,
})

const accumulateAreas = (areas: Areas[]): Areas =>
  areas.reduce((accumulator, current) => {
    return {
      totalFloor: accumulator.totalFloor + current.totalFloor,
      foundation: accumulator.foundation + current.foundation,
      groundFloor: accumulator.groundFloor + current.groundFloor,
      firstFloor: accumulator.firstFloor + current.firstFloor,
      secondFloor: accumulator.secondFloor + current.secondFloor,
      cladding: accumulator.cladding + current.cladding,
      internalLining: accumulator.roofing + current.internalLining,
      roofing: accumulator.roofing + current.roofing,
      bedroom: accumulator.bedroom + current.bedroom,
      bathroom: accumulator.bathroom + current.bathroom,
      living: accumulator.living + current.living,
      kitchen: accumulator.kitchen + current.kitchen,
      windowsAndDoors: accumulator.windowsAndDoors + current.windowsAndDoors,
    }
  }, emptyAreas())

// Costs

export interface Costs {
  foundation: number
  roofStructure: number
  superstructure: number
  roofing: number
  internalLining: number
  cladding: number
  total: number
  comparative: number
}

const emptyCosts = (): Costs => ({
  foundation: 0,
  roofStructure: 0,
  superstructure: 0,
  roofing: 0,
  internalLining: 0,
  cladding: 0,
  total: 0,
  comparative: 0,
})

const accumulateCosts = (areas: Costs[]): Costs =>
  areas.reduce((accumulator, current) => {
    return {
      foundation: accumulator.foundation + current.foundation,
      roofStructure: accumulator.roofStructure + current.roofStructure,
      superstructure: accumulator.superstructure + current.superstructure,
      roofing: accumulator.roofing + current.roofing,
      internalLining: accumulator.internalLining + current.internalLining,
      cladding: accumulator.cladding + current.cladding,
      total: accumulator.total + current.total,
      comparative: accumulator.comparative + current.comparative,
    }
  }, emptyCosts())

// Operational Co2

export interface OperationalCo2 {
  annualTotal: number
  annualComparative: number
  lifetime: number
}

const emptyOperationalCo2 = (): OperationalCo2 => ({
  annualTotal: 0,
  annualComparative: 0,
  lifetime: 0,
})

const accumulateOperationalCo2 = (values: OperationalCo2[]): OperationalCo2 =>
  values.reduce((accumulator, current) => {
    return {
      annualTotal: accumulator.annualTotal + current.annualTotal,
      annualComparative:
        accumulator.annualComparative + current.annualComparative,
      lifetime: accumulator.lifetime + current.lifetime,
    }
  }, emptyOperationalCo2())

// Embodied Co2

export interface EmbodiedCo2 {
  foundations: number
  modules: number
  cladding: number
  total: number
  comparative: number
}

const emptyEmbodiedCo2 = (): EmbodiedCo2 => ({
  foundations: 0,
  modules: 0,
  cladding: 0,
  total: 0,
  comparative: 0,
})

const accumulateEmbodiedCo2 = (values: EmbodiedCo2[]): EmbodiedCo2 =>
  values.reduce((accumulator, current) => {
    return {
      foundations: accumulator.foundations + current.foundations,
      modules: accumulator.modules + current.modules,
      cladding: accumulator.cladding + current.cladding,
      total: accumulator.total + current.total,
      comparative: accumulator.comparative + current.comparative,
    }
  }, emptyEmbodiedCo2())

// Energy use

export interface EnergyUse {
  dhwDemand: number
  spaceHeatingDemand: number
  totalHeatingDemand: number
  primaryEnergyDemand: number
  dhwCost: number
  spaceHeatingCost: number
  totalHeatingCost: number
  primaryEnergyCost: number
}

const emptyEnergyUse = (): EnergyUse => ({
  dhwDemand: 0,
  spaceHeatingDemand: 0,
  totalHeatingDemand: 0,
  primaryEnergyDemand: 0,
  dhwCost: 0,
  spaceHeatingCost: 0,
  totalHeatingCost: 0,
  primaryEnergyCost: 0,
})

const accumulateEnergyUse = (values: EnergyUse[]): EnergyUse =>
  values.reduce((accumulator, current) => {
    return {
      dhwDemand: accumulator.dhwDemand + current.dhwDemand,
      spaceHeatingDemand:
        accumulator.spaceHeatingDemand + current.spaceHeatingDemand,
      totalHeatingDemand:
        accumulator.totalHeatingDemand + current.totalHeatingDemand,
      primaryEnergyDemand:
        accumulator.primaryEnergyDemand + current.primaryEnergyDemand,
      dhwCost: accumulator.dhwCost + current.dhwCost,
      spaceHeatingCost: accumulator.spaceHeatingCost + current.spaceHeatingCost,
      totalHeatingCost: accumulator.totalHeatingCost + current.totalHeatingCost,
      primaryEnergyCost:
        accumulator.primaryEnergyCost + current.primaryEnergyCost,
    }
  }, emptyEnergyUse())

// u-values

export interface UValues {
  glazingUValue: number
  wallUValue: number
  floorUValue: number
  roofUValue: number
}

export interface HouseInfo {
  houseModules: Module[]
  areas: Areas
  costs: Costs
  operationalCo2: OperationalCo2
  embodiedCo2: EmbodiedCo2
  energyUse: EnergyUse
  embodiedCarbon: number
  uValues: UValues
}

// TODO: retrieve from Airtable instead of hard-coding
const comparative = {
  cost: 1600,
  operationalCo2: 20,
  embodiedCo2: 300,
  energyUse: 120,
  electricityTariff: 0.2,
}

const calculateMaterialCosts = (
  house: House,
  context: { elements: Element[]; materials: Material[] }
) => {
  const claddingElementName = "Cladding"

  const claddingElement = context.elements.find(
    (element) =>
      element.systemId === house.systemId &&
      element.name === claddingElementName
  )

  const internalLiningElementName = "Internal wall lining"

  const internalLiningElement = context.elements.find(
    (element) =>
      element.systemId === house.systemId &&
      element.name === internalLiningElementName
  )

  const roofingElementName = "Roofing"

  const roofingElement = context.elements.find(
    (element) =>
      element.systemId === house.systemId && element.name === roofingElementName
  )

  const claddingMaterial: Material | undefined =
    claddingElement &&
    context.materials.find(
      (material) =>
        material.systemId === house.systemId &&
        material.name ===
          (house.modifiedMaterials[claddingElementName] ||
            claddingElement.defaultMaterial)
    )

  const internalLiningMaterial: Material | undefined =
    internalLiningElement &&
    context.materials.find(
      (material) =>
        material.systemId === house.systemId &&
        material.name ===
          (house.modifiedMaterials[internalLiningElementName] ||
            internalLiningElement.defaultMaterial)
    )

  const roofingMaterial: Material | undefined =
    roofingElement &&
    context.materials.find(
      (material) =>
        material.systemId === house.systemId &&
        material.name ===
          (house.modifiedMaterials[roofingElementName] ||
            roofingElement.defaultMaterial)
    )

  return {
    cladding: claddingMaterial?.costPerM2 || 0,
    internalLining: internalLiningMaterial?.costPerM2 || 0,
    roofing: roofingMaterial?.costPerM2 || 0,
  }
}

const calculateHouseInfo = (
  house: House,
  houseModules: Module[],
  context: {
    energyInfo: EnergyInfo
    spaceTypes: SpaceType[]
    windowTypes: WindowType[]
    elements: Element[]
    materials: Material[]
  }
): HouseInfo => {
  const { energyInfo, spaceTypes, windowTypes, elements, materials } = context

  const accumulateIf = (
    fn: (module: Module) => boolean,
    getValue: (module: Module) => number
  ) => {
    return houseModules.reduce((accumulator, current) => {
      return accumulator + (fn(current) ? getValue(current) : 0)
    }, 0)
  }

  const materialCosts = calculateMaterialCosts(house, {
    elements,
    materials,
  })

  const bedroomId = spaceTypes.find(
    (spaceType) =>
      spaceType.systemId === house.systemId && spaceType.code === "BEDR"
  )?.id

  const bathroomId = spaceTypes.find(
    (spaceType) =>
      spaceType.systemId === house.systemId && spaceType.code === "BATH"
  )?.id

  const livingId = spaceTypes.find(
    (spaceType) =>
      spaceType.systemId === house.systemId && spaceType.code === "LIVN"
  )?.id

  const kitchenId = spaceTypes.find(
    (spaceType) =>
      spaceType.systemId === house.systemId && spaceType.code === "KITC"
  )?.id

  const totalFloorArea = accumulateIf(
    () => true,
    (module) => module.floorArea
  )

  const areas: Areas = {
    totalFloor: totalFloorArea,
    foundation: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.floorArea
    ),
    groundFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "G",
      (module) => module.floorArea
    ),
    firstFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "M",
      (module) => module.floorArea
    ),
    secondFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "T",
      (module) => module.floorArea
    ),
    internalLining: accumulateIf(
      () => true,
      (module) => module.liningArea
    ),
    cladding: accumulateIf(
      () => true,
      (module) => module.claddingArea
    ),
    roofing: accumulateIf(
      () => true,
      (module) => module.roofingArea
    ),
    bedroom: accumulateIf(
      (module) => module.spaceType === bedroomId,
      (module) => module.floorArea
    ),
    bathroom: accumulateIf(
      (module) => module.spaceType === bathroomId,
      (module) => module.floorArea
    ),
    living: accumulateIf(
      (module) => module.spaceType === livingId,
      (module) => module.floorArea
    ),
    kitchen: accumulateIf(
      (module) => module.spaceType === kitchenId,
      (module) => module.floorArea
    ),
    windowsAndDoors: accumulateIf(
      () => true,
      (module) => {
        const glazingAreas = [
          module.structuredDna.windowTypeEnd,
          module.structuredDna.windowTypeTop,
          module.structuredDna.windowTypeSide1,
          module.structuredDna.windowTypeSide2,
        ].map(
          (code) =>
            windowTypes.find(
              (windowType) =>
                windowType.code === code &&
                windowType.systemId === house.systemId
            )?.glazingArea || 0
        )
        return glazingAreas.reduce((a, b) => a + b, 0)
      }
    ),
  }

  const roofingCost = accumulateIf(
    () => true,
    (module) => module.roofingArea * materialCosts.roofing
  )

  const internalLiningCost = accumulateIf(
    () => true,
    (module) => module.liningArea * materialCosts.internalLining
  )

  const claddingCost = accumulateIf(
    () => true,
    (module) => module.claddingArea * materialCosts.cladding
  )

  const costs: Costs = {
    foundation: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.cost
    ),
    roofStructure: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "R",
      (module) => module.cost
    ),
    superstructure: accumulateIf(
      (module) =>
        module.structuredDna.levelType[0] !== "F" &&
        module.structuredDna.levelType[0] !== "R",
      (module) => module.cost
    ),
    roofing: roofingCost,
    internalLining: internalLiningCost,
    cladding: claddingCost,
    total: accumulateIf(
      () => true,
      (module) => module.cost + roofingCost + internalLiningCost + claddingCost
    ),
    comparative: totalFloorArea * comparative.cost,
  }

  const annualTotalOperationalCo2 = totalFloorArea * energyInfo.operationalCo2

  const operationalCo2: OperationalCo2 = {
    annualTotal: annualTotalOperationalCo2,
    annualComparative: totalFloorArea * comparative.operationalCo2,
    lifetime: annualTotalOperationalCo2 * 100,
  }

  const embodiedCo2: EmbodiedCo2 = {
    foundations: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.embodiedCarbon
    ),
    modules: accumulateIf(
      (module) => module.structuredDna.levelType[0] !== "F",
      (module) => module.embodiedCarbon
    ),
    cladding: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "R",
      (module) => module.embodiedCarbon
    ),
    comparative: totalFloorArea * comparative.embodiedCo2,
    total: accumulateIf(
      () => true,
      (module) => module.embodiedCarbon
    ),
  }

  const energyUse: EnergyUse = {
    dhwDemand: totalFloorArea * energyInfo.dhwDemand,
    spaceHeatingDemand: totalFloorArea * energyInfo.spaceHeatingDemand,
    totalHeatingDemand: totalFloorArea * energyInfo.totalHeatingDemand,
    primaryEnergyDemand: totalFloorArea * energyInfo.primaryEnergyDemand,
    dhwCost:
      totalFloorArea * energyInfo.dhwDemand * energyInfo.electricityTariff,
    spaceHeatingCost:
      totalFloorArea *
      energyInfo.spaceHeatingDemand *
      energyInfo.electricityTariff,
    totalHeatingCost:
      totalFloorArea *
      energyInfo.totalHeatingDemand *
      energyInfo.electricityTariff,
    primaryEnergyCost:
      totalFloorArea *
      energyInfo.primaryEnergyDemand *
      energyInfo.electricityTariff,
  }

  return {
    houseModules,
    areas,
    costs,
    operationalCo2,
    embodiedCo2,
    energyUse,
    embodiedCarbon: accumulateIf(
      () => true,
      (module) => module.embodiedCarbon
    ),
    uValues: {
      glazingUValue: energyInfo.glazingUValue,
      wallUValue: energyInfo.wallUValue,
      floorUValue: energyInfo.floorUValue,
      roofUValue: energyInfo.roofUValue,
    },
  }
}

const calculate = ({
  houses,
  systemsData,
  selectedHouses,
}: {
  houses: Houses
  systemsData: SystemsData
  selectedHouses: string[]
}): DashboardData => {
  const byHouse = (() => {
    const obj: Record<string, HouseInfo> = {}

    selectedHouses.forEach((houseId) => {
      const house = houses[houseId]
      if (!house) {
        return
      }

      const energyInfo = systemsData.energyInfo.find(
        (info) => info.systemId === house.systemId
      )

      if (!energyInfo) {
        return
      }

      const modules = house.dna
        .map((dna) =>
          systemsData.modules.find(
            (module) => module.dna === dna && module.systemId === house.systemId
          )
        )
        .filter((module): module is Module => Boolean(module))

      obj[houseId] = calculateHouseInfo(house, modules, {
        energyInfo,
        spaceTypes: systemsData.spaceTypes,
        windowTypes: systemsData.windowTypes,
        materials: systemsData.materials,
        elements: systemsData.elements,
      })
    })
    return obj
  })()

  return {
    byHouse,
    areas: accumulateAreas(
      Object.values(byHouse).map((houseInfo) => houseInfo.areas)
    ),
    costs: accumulateCosts(
      Object.values(byHouse).map((houseInfo) => houseInfo.costs)
    ),
    operationalCo2: accumulateOperationalCo2(
      Object.values(byHouse).map((houseInfo) => houseInfo.operationalCo2)
    ),
    embodiedCo2: accumulateEmbodiedCo2(
      Object.values(byHouse).map((houseInfo) => houseInfo.embodiedCo2)
    ),
    energyUse: accumulateEnergyUse(
      Object.values(byHouse).map((houseInfo) => houseInfo.energyUse)
    ),
    unitsCount: selectedHouses.length,
  }
}

// Helpers

export const formatWithUnit = (d: number, unitOfMeasurement: string) => {
  const formatted =
    Math.abs(d) > 1000
      ? `${Math.floor(d / 1000)}k`
      : d.toLocaleString("en-GB", {
          maximumFractionDigits: 1,
        })
  const formattedWithUnit =
    unitOfMeasurement === "€"
      ? `${unitOfMeasurement}${formatted}`
      : `${formatted}${unitOfMeasurement}`
  return formattedWithUnit
}

export const formatWithUnitLong = (d: number, unitOfMeasurement: string) => {
  const formatted = d.toLocaleString("en-GB", {
    maximumFractionDigits: Math.abs(d) > 100 ? 0 : 1,
  })
  const formattedWithUnit =
    unitOfMeasurement === "€"
      ? `${unitOfMeasurement}${formatted}`
      : `${formatted}${unitOfMeasurement}`
  return formattedWithUnit
}

export default calculate
