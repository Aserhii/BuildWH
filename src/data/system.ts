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
import { getSystemSettings, SystemSettings } from "./settings"

export const systems: Array<System> = [
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

export interface System {
  id: string
  name: string
  airtableId: string
}

export interface SystemsData {
  houseTypes: Array<HouseType>
  modules: Array<Module>
  materials: Array<Material>
  elements: Array<Element>
  windowTypes: Array<WindowType>
  internalLayoutTypes: Array<InternalLayoutType>
  energyInfo: Array<EnergyInfo>
  settings: Array<SystemSettings>
}

const CACHE_SYSTEMS_DATA = false

const addCached = (SystemsData: SystemsData): SystemsData => {
  return {
    ...SystemsData,
    materials: SystemsData.materials.map((material) => {
      const threeMaterial = createMaterial(material)
      return { ...material, threeMaterial }
    }),
  }
}

const localStorageKey = "buildx-systems-v2"

const saveSystemsData = (systemsData: SystemsData) => {
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({
      savedAt: new Date().getTime(),
      systemsData,
    })
  )
}

const retrieveSystemsData = (): SystemsData | null => {
  const data = safeLocalStorageGet(localStorageKey)
  if (!data || !data.savedAt) {
    return null
  }
  const savedMinutesAgo = (new Date().getTime() - data.savedAt) / 1000 / 60
  return savedMinutesAgo < 15 ? data.systemsData : null
}

export const useSystemsData = (): SystemsData | "error" | null => {
  const [systemsData, setSystemsData] = useState<SystemsData | "error" | null>(
    null
  )

  useEffect(() => {
    if (!systemsData || systemsData === "error") {
      return
    }
    saveSystemsData(systemsData)
  }, [systemsData])

  const fetch = async () => {
    try {
      const modules = await Promise.all(systems.map(getModules)).then(flatten)

      const windowTypes = await Promise.all(systems.map(getWindowTypes)).then(
        flatten
      )

      const internalLayoutTypes = await Promise.all(
        systems.map(getInternalLayoutTypes)
      ).then(flatten)

      const houseTypes = await Promise.all(
        systems.map((system) => getHouseTypes(system))
      )
        .then(flatten)
        .then((houseTypes) =>
          houseTypes.filter((houseType) => houseType.dna.length > 0)
        )

      const energyInfo = await Promise.all(
        systems.map((system) => getEnergyInfo(system))
      ).then(flatten)

      const materials = await Promise.all(systems.map(getMaterials)).then(
        flatten
      )

      const elements = await Promise.all(
        systems.map((system) => getElements(system, materials))
      ).then(flatten)

      const settings = await Promise.all(
        systems.map((system) => getSystemSettings(system))
      ).then(flatten)

      setSystemsData({
        houseTypes,
        modules,
        materials,
        elements,
        windowTypes,
        internalLayoutTypes,
        energyInfo,
        settings,
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
  const cacheAddedSystemsDataRef = useRef<SystemsData | null>(null)

  if (!systemsData || systemsData === "error") {
    return systemsData
  }

  cacheAddedSystemsDataRef.current =
    cacheAddedSystemsDataRef.current || addCached(systemsData)

  return cacheAddedSystemsDataRef.current
}
