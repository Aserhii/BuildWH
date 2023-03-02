import type { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface StairType {
  id: string
  systemId: string
  code: string
  description: string
}

export const getStairTypes = (system: System): Promise<Array<StairType>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "stair_type" })
    .then((res) =>
      res.records.map((record: any): StairType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["stair_code"] || "",
          description: record.fields?.["description"] || "",
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
