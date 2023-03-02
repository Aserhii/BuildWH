import { proxyMap } from "valtio/utils"
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three"

export type ColorOpts = {
  default: Color
  illuminated: Color
}

export type MaterialKey = {
  buildingId: string
  elementName: string
  levelIndex: number
}

export type MaterialValue = {
  key: MaterialKey
  threeMaterial: MeshStandardMaterial | MeshPhysicalMaterial
  colorOpts: ColorOpts
  colorValue: keyof ColorOpts
}

// key is hash of JSON.stringify([buildingId, elementName, levelIndex])
const materials = proxyMap<string, MaterialValue>()

export const hashMaterialKey = ({
  buildingId,
  elementName,
  levelIndex,
}: MaterialKey) => JSON.stringify([buildingId, elementName, levelIndex])

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

export default materials
