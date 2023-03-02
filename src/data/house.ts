import { DeepReadonly, safeLocalStorageGet } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { map } from "fp-ts/lib/ReadonlyRecord"
import type { Rectangle } from "./collisions"
import { checkRectangleIntersection } from "./collisions"
import type { HouseType } from "./houseType"
import type { Module } from "./module"
import { moduleLayout } from "./moduleLayout"

export type House = {
  id: string
  houseTypeId: string
  systemId: string
  position: [number, number]
  rotation: number
  dna: string[]
  modifiedMaterials: Record<string, string>
  modifiedMaterialsPreview: Record<string, string>
  friendlyName: string
}

export type HouseAug = House & {
  width: number
  length: number
  groundBox: [V2, V2]
}

export type Houses = Record<string, House>

export type HousesAug = Record<string, HouseAug>

export const findCollisions = (
  houses: Houses,
  houseTypes: ReadonlyArray<DeepReadonly<HouseType>>,
  modules: ReadonlyArray<DeepReadonly<Module>>
): Record<string, boolean> => {
  const rectangles: Record<string, Rectangle> = {}
  const collisions: Record<string, boolean> = {}
  Object.entries(houses).forEach(([houseId, house]) => {
    const houseType = houseTypes.find(
      (houseType) => houseType.id === house.houseTypeId
    )

    if (!houseType) {
      return
    }

    const houseModules: Array<Module> = house.dna
      .map((sequence) =>
        modules.find(
          (module) =>
            house.systemId === module.systemId && sequence === module.dna
        )
      )
      .filter((val: Module | undefined): val is Module => !!val)

    const moduleLayoutComputed = moduleLayout(houseModules)

    rectangles[houseId] = {
      wy: moduleLayoutComputed.totalLength,
      wx: moduleLayoutComputed.cellWidths[0] || 1,
      position: house.position,
      rotation: house.rotation,
    }
  })

  Object.entries(rectangles).forEach(([houseId1, rectangle1]) => {
    Object.entries(rectangles).forEach(([houseId2, rectangle2]) => {
      if (
        houseId1 !== houseId2 &&
        checkRectangleIntersection(rectangle1, rectangle2)
      ) {
        collisions[houseId1] = true
        collisions[houseId2] = true
      }
    })
  })

  return collisions
}

const localStorageKey: string = "buildx-houses-v8"

export const saveHouses = (houses: Houses) => {
  localStorage.setItem(localStorageKey, JSON.stringify(houses))
}

export const getHouses = (): Record<string, House> =>
  pipe(
    safeLocalStorageGet(localStorageKey) ?? {},
    map((house: any) => ({
      ...house,
      houseTypeId: house.houseTypeId ?? house.id,
    }))
  )
