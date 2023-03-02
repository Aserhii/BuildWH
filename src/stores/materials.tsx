import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import { stretch } from "@/hooks/stretch"
import builtInMaterials from "@/materials/builtInMaterials"
import defaultMaterial from "@/materials/defaultMaterial"
import { findFirstMap } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { useEffect, useMemo } from "react"
import { Color, MeshPhysicalMaterial, MeshStandardMaterial, Plane } from "three"
import { subscribe, useSnapshot } from "valtio"
import { proxyMap, subscribeKey } from "valtio/utils"
import siteContext from "./context"
import houses from "./houses"

export type ColorOpts = {
  default: Color
  illuminated: Color
}

export type MaterialKey = {
  buildingId: string
  columnIndex: number
  levelIndex: number
  groupIndex: number
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
  groupIndex,
  elementName,
  materialName,
}: MaterialKey) =>
  JSON.stringify([
    buildingId,
    columnIndex,
    levelIndex,
    groupIndex,
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

export const useMaterialName = (
  systemId: string,
  buildingId: string,
  elementName: string
) => {
  const { elements } = useSystemsData()

  const defaultMaterialName =
    elements.find((e) => e.systemId === systemId && e.name === elementName)
      ?.defaultMaterial ?? DEFAULT_MATERIAL_NAME

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
  clippingPlanes: Plane[]
) => {
  const {
    buildingId,
    columnIndex,
    levelIndex,
    groupIndex,
    elementName,
    materialName,
  } = materialKey

  const { materials: sysMaterials } = useSystemsData()

  const material = useMemo(() => {
    const hashKey = hashMaterialKey(materialKey)
    const maybeMaterial = materials.get(hashKey)

    if (maybeMaterial) return maybeMaterial.threeMaterial
    else {
      const threeMaterial = pipe(
        sysMaterials,
        findFirstMap((sysM) =>
          sysM.systemId === houses[buildingId].systemId &&
          sysM.name === materialName &&
          sysM.threeMaterial
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
    groupIndex,
    elementName,
    materialName,
  ])

  useEffect(() => {
    material.clippingPlanes = clippingPlanes
    material.clipShadows = true
  }, [clippingPlanes])

  const visibleByLevelIndex = (): boolean => {
    switch (true) {
      case siteContext.levelIndex === null:
      case siteContext.levelIndex === levelIndex:
        return true
      case levelIndex > (siteContext.levelIndex ?? Infinity):
        return false
      default:
        return true
    }
  }

  const visibleByStretch = (): boolean => {
    const { visibleStartIndex, visibleEndIndex } = stretch
    return columnIndex >= visibleStartIndex && columnIndex <= visibleEndIndex
  }

  const computeVisibility = () => {
    const visible = stretch.stretching
      ? visibleByLevelIndex() && visibleByStretch()
      : visibleByLevelIndex()
    if (material.visible !== visible) material.visible = visible
  }

  useEffect(() => {
    computeVisibility()
    return subscribeKey(siteContext, "levelIndex", computeVisibility)
  }, [])

  useEffect(() => subscribe(stretch, computeVisibility), [])

  return material
}
export default materials
