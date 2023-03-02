import { getField, getAirtableEntries } from "./utils"
import type { MeshStandardMaterial } from "three"
import type { System } from "@/data/system"

export interface Material {
  id: string
  systemId: string
  name: string
  use: string
  defaultFor: Array<string>
  optionalFor: Array<string>
  imageUrl: string
  defaultColor?: string
  costPerM2: number
  threeMaterial?: MeshStandardMaterial
}

export const getMaterials = async (
  system: System
): Promise<Array<Material>> => {
  try {
    const materialMenu = (
      await getAirtableEntries({
        tableId: system.airtableId,
        tab: "materials_menu",
      })
    ).records

    return materialMenu
      .map((materialMenuItem: any) => {
        // Find corresponding texture entry

        const materialField = getField(materialMenuItem.fields || {})

        return {
          id: materialMenuItem.id,
          systemId: system.id,
          name: materialField(["name"]) || "Material",
          defaultFor: materialField(["default_material_for"]) || [],
          optionalFor: materialField(["optional_material_for"]) || [],
          defaultColor: materialField(["default_colour"]),
          costPerM2: materialField(["material_cost_per_m2"]) || 0,
          imageUrl: materialField(["material_image"])?.[0]?.url ?? "",
        }
      })
      .filter((val: Material | undefined) => Boolean(val))
  } catch (err) {
    return []
  }
}
