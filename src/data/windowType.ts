import type { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface WindowType {
  id: string
  systemId: string
  code: string
  description: string
  imageUrl: string
  glazingArea: number
}

export const getWindowTypes = (system: System): Promise<Array<WindowType>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "window_type" })
    .then((res) =>
      res.records.map((record: any): WindowType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["opening_set"] || "",
          description: record.fields?.["description"] || "",
          imageUrl: record.fields?.["image"]?.[0]?.url || "",
          glazingArea: record.fields?.["glazing_area"] || 0,
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
