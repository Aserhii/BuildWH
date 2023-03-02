import { getElements } from "@/data/element"
import { getEnergyInfo } from "@/data/energyInfo"
import { getHouseTypes } from "@/data/houseType"
import { getInternalLayoutTypes } from "@/data/internalLayoutType"
import { getMaterials } from "@/data/material"
import { getModules } from "@/data/module"
import { getWindowTypes } from "@/data/windowType"
import defaultMaterial from "@/materials/defaultMaterial"
import { createMaterial } from "@/utils"
import { flatten, map } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { proxy, useSnapshot } from "valtio"
import { derive } from "valtio/utils"

export interface BuildSystem {
  id: string
  name: string
  airtableId: string
}

// oldest
// airtableId: "appXYQYWjUiAT1Btm",

// clayton
// airtableId: "app7ApkBWMj8Z8gdV",

export const buildSystems: Array<BuildSystem> = [
  {
    id: "sample",
    name: "Sample",
    // tom
    airtableId: "appgVlfhT0anmqi5a",
  },
  // {
  //   id: "mobble",
  //   name: "Mobble",
  //   airtableId: "appYkSYalupnJmUA2",
  // },
]

export const baseSystemsData = proxy({
  modules: Promise.all(pipe(buildSystems, map(getModules))).then(flatten),
  windowTypes: Promise.all(pipe(buildSystems, map(getWindowTypes))).then(
    flatten
  ),
  internalLayoutTypes: Promise.all(
    buildSystems.map(getInternalLayoutTypes)
  ).then(flatten),
  houseTypes: Promise.all(pipe(buildSystems, map(getHouseTypes)))
    .then(flatten)
    .then((houseTypes) =>
      houseTypes.filter((houseType) => houseType.dna.length > 0)
    ),
  energyInfo: Promise.all(pipe(buildSystems, map(getEnergyInfo))),
  materials: Promise.all(pipe(buildSystems, map(getMaterials))).then(flatten),
})

const derivedSystemsData = derive({
  elements: (get) =>
    Promise.all(
      pipe(
        buildSystems,
        map(async (system) =>
          getElements(system, await get(baseSystemsData).materials)
        )
      )
    ).then(flatten),
  materials: async (get) =>
    (await get(baseSystemsData).materials).map((material) => {
      const threeMaterial =
        typeof document === "undefined"
          ? defaultMaterial
          : createMaterial(material)
      return { ...material, threeMaterial }
    }),
})

export const systemsData = proxy({
  ...baseSystemsData,
  ...derivedSystemsData,
})

export const useSystemsData = () => useSnapshot(systemsData)

export default systemsData
