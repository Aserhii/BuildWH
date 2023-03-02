import { type Module } from "@/data/module"
import { type SystemsData } from "@/data/system"
import { type Houses } from "@/data/house"

export interface DashboardData {
  byHouse: Record<string, HouseInfo>
  unitsCount: number
  areas: Areas
}

// Areas

export interface Areas {
  building: number
  foundation: number
  groundFloor: number
  firstFloor: number
  secondFloor: number
  roof: number
}

const emptyAreas = (): Areas => ({
  building: 0,
  foundation: 0,
  groundFloor: 0,
  firstFloor: 0,
  secondFloor: 0,
  roof: 0,
})

const accumulateAreas = (areas: Areas[]): Areas =>
  areas.reduce((accumulator, current) => {
    return {
      building: accumulator.building + current.building,
      foundation: accumulator.foundation + current.foundation,
      groundFloor: accumulator.groundFloor + current.groundFloor,
      firstFloor: accumulator.firstFloor + current.firstFloor,
      secondFloor: accumulator.secondFloor + current.secondFloor,
      roof: accumulator.roof + current.roof,
    }
  }, emptyAreas())

// Costs

export interface HouseInfo {
  houseModules: Module[]
  areas: Areas
  cost: number
  embodiedCarbon: number
}

const calculateHouseInfo = (houseModules: Module[]): HouseInfo => {
  const accumulateIf = (
    fn: (module: Module) => boolean,
    getValue: (module: Module) => number
  ) => {
    return houseModules.reduce((accumulator, current) => {
      return accumulator + (fn(current) ? getValue(current) : 0)
    }, 0)
  }
  return {
    houseModules,
    areas: {
      building: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "G",
        (module) => module.width * module.height
      ),
      foundation: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "F",
        (module) => module.width * module.height
      ),
      groundFloor: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "G",
        (module) => module.width * module.height
      ),
      firstFloor: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "M",
        (module) => module.width * module.height
      ),
      secondFloor: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "T",
        (module) => module.width * module.height
      ),
      roof: accumulateIf(
        (module) => module.structuredDna.levelType[0] === "R",
        (module) => module.width * module.height
      ),
    },
    cost: accumulateIf(
      () => true,
      (module) => module.cost
    ),
    embodiedCarbon: accumulateIf(
      () => true,
      (module) => module.embodiedCarbon
    ),
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
      const modules = house.dna
        .map((dna) =>
          systemsData.modules.find(
            (module) => module.dna === dna && module.systemId === house.systemId
          )
        )
        .filter((module): module is Module => Boolean(module))

      obj[houseId] = calculateHouseInfo(modules)
    })
    return obj
  })()

  const areas = accumulateAreas(Object.values(byHouse).map(houseInfo => houseInfo.areas))

  return {
    byHouse,
    areas,
    unitsCount: selectedHouses.length,
  }
}

export default calculate
