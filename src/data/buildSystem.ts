import { safeLocalStorageGet } from "../utils"
import { createMaterial } from "../utils/three"
import { useState, useEffect, useRef } from "react"
import { flatten } from "ramda"
import type { HouseType } from "./houseType"
import { getEnergyInfo } from "./energyInfo"
import type { EnergyInfo } from "./energyInfo"
import { getHouseTypes } from "./houseType"
import type { Module } from "./module"
import { getModules } from "./module"
import type { Material } from "./material"
import { getMaterials } from "./material"
import type { InternalLayoutType } from "./internalLayoutType"
import { getInternalLayoutTypes } from "./internalLayoutType"
import type { Element } from "./element"
import { getElements } from "./element"
import type { WindowType } from "./windowType"
import { getWindowTypes } from "./windowType"

export const buildSystems: Array<BuildSystem> = [
  {
    id: "sampleTom",
    name: "Sample Tom",
    airtableId: "appgVlfhT0anmqi5a",
  },
  {
    id: "sampleClayton",
    name: "Sample Clayton",
    airtableId: "app7ApkBWMj8Z8gdV",
  },
  // {
  //   id: "mobble",
  //   name: "Mobble",
  //   airtableId: "appYkSYalupnJmUA2",
  // },
]
// oldest
// airtableId: "appXYQYWjUiAT1Btm",

export interface BuildSystem {
  id: string
  name: string
  airtableId: string
}

export interface BuildSystemsData {
  houseTypes: Array<HouseType>
  modules: Array<Module>
  materials: Array<Material>
  elements: Array<Element>
  windowTypes: Array<WindowType>
  internalLayoutTypes: Array<InternalLayoutType>
  energyInfo: Array<EnergyInfo>
}

const CACHE_SYSTEMS_DATA = true

const addCached = (buildSystemsData: BuildSystemsData): BuildSystemsData => {
  return {
    ...buildSystemsData,
    materials: buildSystemsData.materials.map((material) => {
      const threeMaterial = createMaterial(material)
      return { ...material, threeMaterial }
    }),
  }
}

const localStorageKey = "buildx-systems-v2"

const saveSystemsData = (systemsData: BuildSystemsData) => {
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({
      savedAt: new Date().getTime(),
      systemsData,
    })
  )
}

const retrieveSystemsData = (): BuildSystemsData | null => {
  const data = safeLocalStorageGet(localStorageKey)
  if (!data || !data.savedAt) {
    return null
  }
  const savedMinutesAgo = (new Date().getTime() - data.savedAt) / 1000 / 60
  return savedMinutesAgo < 15 ? data.systemsData : null
}

export const useSystemsData = (): BuildSystemsData | "error" | null => {
  const [systemsData, setSystemsData] = useState<
    BuildSystemsData | "error" | null
  >(null)

  useEffect(() => {
    if (!systemsData || systemsData === "error") {
      return
    }
    saveSystemsData(systemsData)
  }, [systemsData])

  const fetch = async () => {
    try {
      const modules = await Promise.all(buildSystems.map(getModules)).then(
        flatten
      )

      const windowTypes = await Promise.all(
        buildSystems.map(getWindowTypes)
      ).then(flatten)

      const internalLayoutTypes = await Promise.all(
        buildSystems.map(getInternalLayoutTypes)
      ).then(flatten)

      const houseTypes = await Promise.all(
        buildSystems.map((system) => getHouseTypes(system))
      )
        .then(flatten)
        .then((houseTypes) =>
          houseTypes.filter((houseType) => houseType.dna.length > 0)
        )

      const energyInfo = await Promise.all(
        buildSystems.map((system) => getEnergyInfo(system))
      ).then(flatten)

      const materials = await Promise.all(buildSystems.map(getMaterials)).then(
        flatten
      )

      const elements = await Promise.all(
        buildSystems.map((system) => getElements(system, materials))
      ).then(flatten)

      setSystemsData({
        houseTypes,
        modules,
        materials,
        elements,
        windowTypes,
        internalLayoutTypes,
        energyInfo,
      })
    } catch (err) {
      setSystemsData("error")
    }
  }

  useEffect(() => {
    const savedSystemsData = CACHE_SYSTEMS_DATA ? retrieveSystemsData() : null
    if (savedSystemsData) {
      setSystemsData(savedSystemsData)
    } else {
      fetch()
    }
  }, [])

  /**
   * Systems data is delivered to the rest of the application with a few pre-computed
   * (cached) pieces of information such as readily defined three.js materials.
   * When this hook is run again, the app checks if this ref holds an already computed
   * value. This is important to keep reference equality and prevent hook re-runs
   * elsewhere in the app.
   */
  const cacheAddedSystemsDataRef = useRef<BuildSystemsData | null>(null)

  if (!systemsData || systemsData === "error") {
    return systemsData
  }

  cacheAddedSystemsDataRef.current =
    cacheAddedSystemsDataRef.current || addCached(systemsData)

  return cacheAddedSystemsDataRef.current
}