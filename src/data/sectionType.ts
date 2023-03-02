import type { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface SectionType {
  id: string
  systemId: string
  code: string
  description: string
  width: number
}

export const getSectionTypes = (system: System): Promise<Array<SectionType>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "section_type" })
    .then((res) =>
      res.records.map((record: any): SectionType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["section_code"] || "",
          description: record.fields?.["description"] || "",
          width: record.fields?.["section_width"] || 0,
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
