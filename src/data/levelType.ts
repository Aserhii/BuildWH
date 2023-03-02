import type { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface LevelType {
  id: string
  systemId: string
  code: string
  description: string
  imageUrl: string
}

export const getLevelTypes = (system: System): Promise<Array<LevelType>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "level_type" })
    .then((res) =>
      res.records.map((record: any): LevelType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["level_code"] || "",
          description: record.fields?.["description"] || "",
          imageUrl: record.fields?.["image"]?.[0]?.url || "",
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
