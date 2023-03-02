import type { BuildSystem } from "@/data/buildSystem"
import { getAirtableEntries } from "./utils"

export interface InternalLayoutType {
  id: string
  systemId: string
  code: string
  description: string
}

export const getInternalLayoutTypes = (
  system: BuildSystem
): Promise<Array<InternalLayoutType>> =>
  getAirtableEntries({
    tableId: system.airtableId,
    tab: "internal_layout_type",
  })
    .then((res) =>
      res.records.map((record: any): InternalLayoutType => {
        return {
          id: record.id,
          systemId: system.id,
          code: record.fields?.["internal_layout_code"] || "",
          description: record.fields?.["description"] || "",
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })
