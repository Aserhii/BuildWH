import type { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface SpaceType {
  id: string
  systemId: string
  code: string
  description: string
}

export const getSpaceTypes = (system: System): Promise<Array<SpaceType>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "space_type" })
    .then((res) =>
      res.records.map((record: any): SpaceType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["space_code"] || "",
          description: record.fields?.["description"] || "",
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
