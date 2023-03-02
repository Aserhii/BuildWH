import { type Element } from "@/data/element"
import { type EnergyInfo } from "@/data/energyInfo"
import { HouseType } from "@/data/houseType"
import { type InternalLayoutType } from "@/data/internalLayoutType"
import { LevelType } from "@/data/levelType"
import { type Material } from "@/data/material"
import { Module } from "@/data/module"
import { SectionType } from "@/data/sectionType"
import { type SystemSettings } from "@/data/settings"
import { type SpaceType } from "@/data/spaceType"
import { type StairType } from "@/data/stairType"
import { System } from "@/data/system"
import { type WindowType } from "@/data/windowType"
import { flatten } from "ramda"
import { useEffect, useState } from "react"
import { proxy, useSnapshot } from "valtio"
import * as z from "zod"
import config from "../../buildx.config.yaml"
import { useSystemId } from "./context"
import { getElements } from "@/data/element"
import { getEnergyInfo } from "@/data/energyInfo"
import { getHouseTypes } from "@/data/houseType"
import { getInternalLayoutTypes } from "@/data/internalLayoutType"
import { getLevelTypes } from "@/data/levelType"
import { getMaterials } from "@/data/material"
import { getModules } from "@/data/module"
import { getSectionTypes } from "@/data/sectionType"
import { getSystemSettings } from "@/data/settings"
import { getSpaceTypes } from "@/data/spaceType"
import { getStairTypes } from "@/data/stairType"
import { getWindowTypes } from "@/data/windowType"
import { mapA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import useSWR from "swr"

const systems: Array<System> = z
  .array(
    z.object({
      id: z.string().nonempty(),
      name: z.string().nonempty(),
      airtableId: z.string().nonempty(),
    })
  )
  .parse(config.systems)

export type SystemData = {
  houseTypes: Array<HouseType>
  modules: Array<Module>
  materials: Array<Material>
  elements: Array<Element>
  windowTypes: Array<WindowType>
  stairTypes: Array<StairType>
  internalLayoutTypes: Array<InternalLayoutType>
  levelTypes: Array<LevelType>
  energyInfo: Array<EnergyInfo>
  spaceTypes: Array<SpaceType>
  sectionTypes: Array<SectionType>
  settings: Array<SystemSettings>
}

// export const allSystemsData = proxy<SystemData>({
//   houseTypes: [],
//   modules: [],
//   materials: [],
//   elements: [],
//   windowTypes: [],
//   stairTypes: [],
//   internalLayoutTypes: [],
//   levelTypes: [],
//   energyInfo: [],
//   spaceTypes: [],
//   sectionTypes: [],
//   settings: [],
// })

export const systemsData = proxy<Record<string, SystemData>>({})

// export const useAllSystemsData = () => {
//   const snap = useSnapshot(allSystemsData)
//   if (snap.elements.length === 0) throw new Error("No elements in systems data")
//   return snap
// }

export const useSystemData = (systemId?: string) => {
  const selectedBuildingId = useSystemId()

  const snap = useSnapshot(systemsData)

  if (!systemId && typeof selectedBuildingId !== "string")
    throw new Error(
      "useSystemData called without a building selected and without a system ID"
    )

  const id: string = systemId ?? selectedBuildingId!

  if (snap[id].elements.length < 1)
    throw new Error(`No elements in system ${id} data`)

  return snap[id]
}

export const getSystemsData = async () => {
  try {
    // const modules = await Promise.all(systems.map(getModules)).then(flatten)

    // const foo = pipe(systems, mapA(getModules), (ps) =>
    //   Promise.all(ps).then((xs) =>
    //     xs.reduce((acc, modules) => {
    //       const { systemId } = modules[0]
    //       systemsData[systemId].modules = modules
    //       return []
    //     })
    //   )
    // )

    const foo = await Promise.all(
      systems.map(async (system) => {
        console.log("am I even ever")
        const modules = await getModules(system)
        systemsData[system.id].modules = modules
        console.log(systemsData)
      })
    )

    // for (const system of systems)
    //   for (const system of systems) {
    //     console.log(system)
    //     const modules = await getModules(system)
    //     console.log(modules)
    //     systemsData[system.id].modules = modules
    //   }

    // const windowTypes = await Promise.all(systems.map(getWindowTypes)).then(
    //   flatten
    // )

    // const levelTypes = await Promise.all(systems.map(getLevelTypes)).then(
    //   flatten
    // )

    // const stairTypes = await Promise.all(systems.map(getStairTypes)).then(
    //   flatten
    // )

    // const internalLayoutTypes = await Promise.all(
    //   systems.map(getInternalLayoutTypes)
    // ).then(flatten)

    // const spaceTypes = await Promise.all(systems.map(getSpaceTypes)).then(
    //   flatten
    // )

    // const sectionTypes = await Promise.all(systems.map(getSectionTypes)).then(
    //   flatten
    // )

    // const houseTypes = await Promise.all(
    //   systems.map((system) => getHouseTypes(system))
    // )
    //   .then(flatten)
    //   .then((houseTypes) =>
    //     houseTypes.filter((houseType) => houseType.dna.length > 0)
    //   )

    // const energyInfo = await Promise.all(
    //   systems.map((system) => getEnergyInfo(system))
    // ).then(flatten)

    // const materials = await Promise.all(systems.map(getMaterials)).then(flatten)

    // const elements = await Promise.all(
    //   systems.map((system) => getElements(system, materials))
    // ).then(flatten)

    // const settings = await Promise.all(
    //   systems.map((system) => getSystemSettings(system))
    // ).then(flatten)

    // allSystemsData.modules = modules
    // allSystemsData.houseTypes = houseTypes
    // allSystemsData.materials = materials
    // allSystemsData.elements = elements
    // allSystemsData.windowTypes = windowTypes
    // allSystemsData.stairTypes = stairTypes
    // allSystemsData.internalLayoutTypes = internalLayoutTypes
    // allSystemsData.levelTypes = levelTypes
    // allSystemsData.energyInfo = energyInfo
    // allSystemsData.spaceTypes = spaceTypes
    // allSystemsData.sectionTypes = sectionTypes
    // allSystemsData.settings = settings
  } catch (err) {
    // allSystemsData.modules = []
    // allSystemsData.houseTypes = []
    // allSystemsData.materials = []
    // allSystemsData.elements = []
    // allSystemsData.windowTypes = []
    // allSystemsData.stairTypes = []
    // allSystemsData.internalLayoutTypes = []
    // allSystemsData.levelTypes = []
    // allSystemsData.energyInfo = []
    // allSystemsData.spaceTypes = []
    // allSystemsData.sectionTypes = []
    // allSystemsData.settings = []
    // for (let k of Object.keys(systemsData)) {
    //   delete systemsData[k]
    // }
  }
}

export const useInitSystemsData = () => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return

    getSystemsData()
      .then(() => setLoaded(true))
      .catch((e) => console.log({ e }))
  }, [loaded])

  return loaded
}

const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY

const sharedAirtableHeaders = {
  Authorization: `Bearer ${apiKey}`,
}

export const useSystemsSWR = () => {
  const fetcher = (tableIds: string[], tabs: string[]) =>
    Promise.all(
      tableIds.map((tableId) =>
        Promise.all(
          tabs.map((tab) =>
            fetch(
              `https://api.airtable.com/v0/${tableId}/${encodeURIComponent(
                tab
              )}`,
              {
                headers: {
                  ...sharedAirtableHeaders,
                },
              }
            ).then((x) => x.json())
          )
        )
      )
    )

  // const modules = useSWR(["modules", ],fetcher)
}
