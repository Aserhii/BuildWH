import { safeLocalStorageGet } from "../utils"
import { createMaterial } from "../utils/three"
import { useState, useEffect, useRef } from "react"
import { flatten } from "ramda"
import { getEnergyInfo, type EnergyInfo } from "./energyInfo"
import { type HouseType, getHouseTypes } from "./houseType"
import { getModules, type Module } from "./module"
import { type Material, getMaterials } from "./material"
import {
  type InternalLayoutType,
  getInternalLayoutTypes,
} from "./internalLayoutType"
import { type Element, getElements } from "./element"
import { type WindowType, getWindowTypes } from "./windowType"
import { type SpaceType, getSpaceTypes } from "./spaceType"
import { getSystemSettings, type SystemSettings } from "./settings"
import { getStairTypes, type StairType } from "./stairType"

export const systems: Array<System> = [
  // {
  //   id: "sample",
  //   name: "Sample",
  //   airtableId: "app7ApkBWMj8Z8gdV",
  // },
  {
    id: "3cea-amvic",
    name: "3CEA-AMVIC",
    airtableId: "appsOHJyDxhPrHyxc",
  },
  {
    id: "mobble",
    name: "Mobble",
    airtableId: "app25JFkKVKKEt5io",
  },
  {
    id: "swift",
    name: "Swift",
    airtableId: "appGlzQcCZpDNRFsE",
  },
]

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
  stairTypes: Array<StairType>
  internalLayoutTypes: Array<InternalLayoutType>
  energyInfo: Array<EnergyInfo>
  spaceTypes: Array<SpaceType>
  settings: Array<SystemSettings>
}

const CACHE_SYSTEMS_DATA = true

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

      const stairTypes = await Promise.all(systems.map(getStairTypes)).then(
        flatten
      )

      const internalLayoutTypes = await Promise.all(
        systems.map(getInternalLayoutTypes)
      ).then(flatten)

      const spaceTypes = await Promise.all(systems.map(getSpaceTypes)).then(
        flatten
      )

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
        stairTypes,
        internalLayoutTypes,
        energyInfo,
        spaceTypes,
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
