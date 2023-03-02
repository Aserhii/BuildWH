import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import { stretch } from "@/hooks/stretch"
import builtInMaterials from "@/materials/builtInMaterials"
import defaultMaterial from "@/materials/defaultMaterial"
import { findFirstMap } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { useMemo } from "react"
import {
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Plane,
  Vector3,
} from "three"
import { subscribe, useSnapshot } from "valtio"
import { proxyMap, subscribeKey } from "valtio/utils"
import context from "./context"
import houses from "./houses"

export type ColorOpts = {
  default: Color
  illuminated: Color
}

export type MaterialKey = {
  buildingId: string
  columnIndex: number
  levelIndex: number
  elementName: string
  materialName: string
}

export type MaterialValue = {
  key: MaterialKey
  threeMaterial: MeshStandardMaterial | MeshPhysicalMaterial
  colorOpts: ColorOpts
  colorValue: keyof ColorOpts
}

type MaterialKeyHash = string

const materials = proxyMap<MaterialKeyHash, MaterialValue>()

export const hashMaterialKey = ({
  buildingId,
  columnIndex,
  levelIndex,
  elementName,
  materialName,
}: MaterialKey) =>
  JSON.stringify([
    buildingId,
    columnIndex,
    levelIndex,
    elementName,
    materialName,
  ])

export const pushMaterial = (material: MaterialValue) => {
  const hashKey = hashMaterialKey(material.key)
  if (!(hashKey in hashMaterialKey)) materials.set(hashKey, material)
}

export const setMaterialColor = (
  material: MaterialValue,
  color: keyof ColorOpts
) => {
  material.threeMaterial.color.set(material.colorOpts[color])
  material.colorValue = color
}

export const useMaterialName = (buildingId: string, elementName: string) => {
  const { elements } = useSystemsData()

  const defaultMaterialName =
    elements.find((e) => e.name === elementName)?.defaultMaterial ??
    DEFAULT_MATERIAL_NAME

  const { modifiedMaterials, modifiedMaterialsPreview } = useSnapshot(
    houses[buildingId]
  )

  return useMemo(() => {
    if (elementName in modifiedMaterialsPreview)
      return modifiedMaterialsPreview[elementName]
    else if (elementName in modifiedMaterials)
      return modifiedMaterials[elementName]
    else return defaultMaterialName
  }, [modifiedMaterials, modifiedMaterialsPreview])
}

export const useMaterial = (
  materialKey: MaterialKey,
  clippingPlaneHeight: number
) => {
  const { buildingId, columnIndex, levelIndex, elementName } = materialKey

  const { materials: sysMaterials } = useSystemsData()

  const clippingPlane = useMemo(
    () => new Plane(new Vector3(0, -1, 0), clippingPlaneHeight),
    [clippingPlaneHeight]
  )

  const materialName = useMaterialName(buildingId, elementName)

  const material = useMemo(() => {
    const hashKey = hashMaterialKey(materialKey)
    const maybeMaterial = materials.get(hashKey)

    if (maybeMaterial) return maybeMaterial.threeMaterial
    else {
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
        illuminated: threeMaterial.color.clone().add(new Color("#bbb")),
      }

      const material: MaterialValue = {
        threeMaterial,
        colorOpts,
        colorValue: "default",
        key: materialKey,
      }

      materials.set(hashKey, material)

      return material.threeMaterial
    }
  }, [
    buildingId,
    columnIndex,
    levelIndex,
    elementName,
    clippingPlane,
    materialName,
  ])

  subscribeKey(context, "levelIndex", () => {
    switch (true) {
      case context.levelIndex === null:
        if (material.visible === false) material.visible = true
        if (material.clippingPlanes !== null) material.clippingPlanes = null
        break
      case context.levelIndex === levelIndex:
        if (material.visible === false) material.visible = true
        if (material.clippingPlanes === null)
          material.clippingPlanes = [clippingPlane]
        break
      default:
        const above = levelIndex < context.levelIndex!
        if (material.visible === !above) material.visible = above
        if (material.clippingPlanes !== null) material.clippingPlanes = null
        break
    }
  })

  subscribe(stretch, () => {
    const { visibleStartIndex, visibleEndIndex } = stretch

    material.visible =
      columnIndex >= visibleStartIndex && columnIndex <= visibleEndIndex
  })

  return material
}
export default materials
