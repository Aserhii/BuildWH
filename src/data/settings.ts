import { useBuildSystemsData } from "@/contexts/BuildSystemsData"
import type { BuildSystem } from "@/data/buildSystem"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap } from "fp-ts/lib/ReadonlyArray"
import { getAirtableEntries } from "./utils"

type ClampedDimension = {
  min: number
  max: number
  units: string
}

export interface SystemSettings {
  systemId: string
  length: ClampedDimension
  height: ClampedDimension
}

export const getSystemSettings = (
  system: BuildSystem
): Promise<SystemSettings> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "system_settings" })
    .then((res) => {
      const fields = res.records.reduce((acc: any, record: any): any => {
        return {
          ...acc,
          [record.fields.Field]: {
            min: record.fields.minimum,
            max: record.fields.maximum,
            units: record.fields.units,
          },
        }
      }, {})

      return {
        ...fields,
        systemId: system.id,
      }
    })
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })

export const useBuildSystemSettings = (id: string) => {
  const { settings } = useBuildSystemsData()

  return pipe(
    settings,
    findFirstMap(({ systemId, height, length }) =>
      systemId === id ? some({ height, length }) : none
    ),
    getOrElse(() => ({
      height: { min: 0, max: 10 },
      length: { min: 0, max: 100 },
    }))
  )
}
