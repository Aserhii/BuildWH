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
  textureUrl: string
  defaultColor?: string
  bumpUrl?: string
  glossUrl?: string
  normUrl?: string
  displacementUrl?: string
  metalnessUrl?: string
  specularityUrl?: string
  roughnessUrl?: string
  aoUrl?: string
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

    // Fetch texture library, a tab that is referenced by the material menu tab
    const textureLibrary = (
      await getAirtableEntries({
        tableId: system.airtableId,
        tab: "texture_library",
      })
    ).records

    return materialMenu
      .map((materialMenuItem: any) => {
        // Find corresponding texture entry
        const texture = textureLibrary.find(
          (textureLibraryItem: any) =>
            textureLibraryItem.id === materialMenuItem.fields["texture"]?.[0]
        )

        if (!texture) {
          return undefined
        }
        const materialField = getField(materialMenuItem.fields || {})
        const textureField = getField(texture.fields || {})
        const textureUrl = textureField(["base_color_map"])?.[0]?.url
        const bumpUrl = textureField(["bump_map"])?.[0]?.url
        const glossUrl = textureField(["gloss_map"])?.[0]?.url
        const normUrl = textureField(["normal_map"])?.[0]?.url
        const displacementUrl =
          // Disable temporarily to prevent glitches
          undefined && textureField(["displacement_map"])?.[0]?.url
        const specularityUrl = textureField(["specularity_map"])?.[0]?.url
        const roughnessUrl = textureField(["roughness_map"])?.[0]?.url
        const aoUrl = textureField(["ao_map"])?.[0]?.url
        return {
          id: materialMenuItem.id,
          systemId: system.id,
          name: materialField(["name"]) || "Material",
          defaultFor: materialField(["default_material_for"]) || [],
          optionalFor: materialField(["optional_material_for"]) || [],
          defaultColor: materialField(["default_colour"]),
          costPerM2: materialField(["material_cost_per_m2"]) || 0,
          textureUrl,
          bumpUrl,
          glossUrl,
          normUrl,
          displacementUrl,
          specularityUrl,
          aoUrl,
          roughnessUrl,
        }
      })
      .filter((val: Material | undefined) => Boolean(val))
  } catch (err) {
    return []
  }
}
