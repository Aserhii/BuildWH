import type { Material } from "./material"
import { getField, getAirtableEntries } from "./utils"
import { includes } from "ramda"
import { BuildSystem } from "@/data/buildSystem"

export interface Element {
  id: string
  systemId: string
  name: string
  ifc4Variable: string
  defaultMaterial: string
  materialOptions: Array<string>
}

export const getElements = (
  system: BuildSystem,
  materials: Array<Material>
): Promise<Array<Element>> =>
  getAirtableEntries({
    tableId: system.airtableId,
    tab: "building_elements",
  })
    .then((res) => {
      return res.records.map((record: any): Element => {
        // Cross-reference in material array to find corresponding default material name
        // and material options names.
        const optionalMaterials = materials.filter((material) =>
          includes(record.id, material.optionalFor)
        )
        const defaultMaterials = materials.filter((material) =>
          includes(record.id, material.defaultFor)
        )
        const field = getField(record.fields || {})
        const defaultMaterial =
          defaultMaterials[0]?.name || optionalMaterials[0]?.name || ""
        const materialOptions = optionalMaterials.map(
          (material) => material.name
        )
        return {
          id: record.id,
          systemId: system.id,
          name: (field(["slug", "element_code"]) || "element").trim(),
          ifc4Variable: field(["ifc4_variable"]) || "",
          defaultMaterial,
          materialOptions,
        }
      })
    })
    .catch(() => Promise.resolve([]))
