import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import materials, {
  ColorOpts,
  hashMaterialKey,
  MaterialKey,
  MaterialValue,
} from "@/stores/materials"
import houses from "@/stores/houses"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap } from "fp-ts/lib/ReadonlyArray"
import { useMemo } from "react"
import { Color, MeshPhysicalMaterial, Plane, Vector3 } from "three"
import invisibleMaterial from "@/materials/invisibleMaterial"
import { useColumnLayout } from "./layouts"

const builtInMaterials: Record<string, MeshPhysicalMaterial> = {
  Glazing: glassMaterial,
}

const useMaterial = (
  materialKey: MaterialKey,
  moduleHeight: number,
  visible: boolean = true
) => {
  const { buildingId, elementName, levelIndex } = materialKey
  const { elements, materials: sysMaterials } = useSystemsData()

  const columnLayout = useColumnLayout(buildingId)
  const clippingPlaneHeight =
    columnLayout[0].gridGroups[levelIndex].y + moduleHeight / 2

  const clippingPlane = useMemo(
    () => new Plane(new Vector3(0, -1, 0), clippingPlaneHeight),
    [clippingPlaneHeight]
  )

  return useMemo(() => {
    if (!visible) return invisibleMaterial
    const hashKey = hashMaterialKey(materialKey)
    const maybeMaterial = materials.get(hashKey) // materials?.[buildingId]?.[elementName]?.[levelIndex]

    if (maybeMaterial) return maybeMaterial.threeMaterial
    else {
      const materialName =
        houses[buildingId].modifiedMaterials?.[elementName] ??
        elements.find((e) => e.name === elementName)?.defaultMaterial ??
        DEFAULT_MATERIAL_NAME

      const threeMaterial = pipe(
        sysMaterials,
        findFirstMap((sysM) =>
          sysM.name === materialName && sysM.threeMaterial
            ? some(sysM.threeMaterial)
            : none
        ),
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        ),
        (m) => m.clone()
      )

      const colorOpts: ColorOpts = {
        default: threeMaterial.color.clone(),
        illuminated: threeMaterial.color.clone().add(new Color("#ff0000")),
      }

      const material: MaterialValue = {
        threeMaterial,
        colorOpts,
        colorValue: "default",
        key: materialKey,
      }

      material.threeMaterial.clippingPlanes = [clippingPlane]

      materials.set(hashKey, material)

      return material.threeMaterial
    }
  }, [buildingId, elementName, levelIndex, visible, clippingPlane])
}

export default useMaterial
