import { isMesh } from "@/utils"
import { invalidate } from "@react-three/fiber"
import { MutableRefObject } from "react"
import { Group, Object3D } from "three"
import { proxy, ref } from "valtio"
import { proxyMap } from "valtio/utils"
import materials, {
  hashMaterialKey,
  MaterialKey,
  setMaterialColor,
} from "./materials"

type MaterialKeyHash = string

type Highights = {
  outlined: Array<Object3D>
  illuminatedMaterials: Map<MaterialKeyHash, MaterialKey>
}
const highlights = proxy<Highights>({
  outlined: [],
  illuminatedMaterials: proxyMap(),
})

export const pushIlluminatedMaterial = (rawKey: MaterialKey) => {
  const hashKey = hashMaterialKey(rawKey)
  if (highlights.illuminatedMaterials.has(hashKey)) return
  const material = materials.get(hashKey)
  if (!material) throw new Error(`No such key ${hashKey}`)
  setMaterialColor(material, "illuminated")
  highlights.illuminatedMaterials.set(hashKey, rawKey)
}

export const popIlluminatedMaterial = (rawKey: MaterialKey) => {
  const hashKey = hashMaterialKey(rawKey)
  if (!highlights.illuminatedMaterials.has(hashKey)) return
  const material = materials.get(hashKey)
  if (!material) throw new Error(`No such key ${hashKey}`)
  setMaterialColor(material, "default")
  highlights.illuminatedMaterials.delete(hashKey)
}

export const clearIlluminatedMaterials = () => {
  highlights.illuminatedMaterials.forEach((x) => {
    popIlluminatedMaterial(x)
  })
}

export const clearExceptLevel = (levelIndex: number) => {
  highlights.illuminatedMaterials.forEach((x) => {
    if (x.levelIndex === levelIndex) return
    popIlluminatedMaterial(x)
  })
}

export const setIlluminatedLevel = (
  buildingId: string,
  targetLevel: number
) => {
  clearExceptLevel(targetLevel)
  materials.forEach((material) => {
    if (
      material.key.buildingId === buildingId &&
      material.key.levelIndex === targetLevel
    ) {
      pushIlluminatedMaterial(material.key)
    }
  })
}

export const outlineGroup = (
  groupRef: MutableRefObject<Group | undefined>,
  opts: { remove: boolean } = { remove: false }
) => {
  if (!groupRef.current) return

  const { remove = false } = opts
  const objs: Array<Object3D> = []

  let changed = false
  groupRef.current.traverse((o3) => {
    if (isMesh(o3)) {
      const next = ref(o3)
      objs.push(next)
      if (highlights.outlined.indexOf(next) === -1) changed = true
    }
  })

  if (changed && !remove) {
    highlights.outlined = objs
  }

  if (remove) {
    highlights.outlined = highlights.outlined.filter(
      (x) => objs.findIndex((y) => y.id === x.id) === -1
    )
  }
  invalidate()
}

// export const illuminateGroup = (
//   groupRef: MutableRefObject<Group | undefined>,
//   opts: { remove: boolean } = { remove: false }
// ) => {
//   if (!groupRef.current) return

//   const { remove = false } = opts
//   const objs: Array<Object3D> = []

//   let changed = false
//   groupRef.current.traverse((o3) => {
//     if (isMesh(o3)) {
//       const next = ref(o3)
//       objs.push(next)
//       if (highlights.illuminated.indexOf(next) === -1) changed = true
//     }
//   })

//   if (changed && !remove) {
//     highlights.illuminated = objs
//   }

//   if (remove) {
//     highlights.illuminated = highlights.illuminated.filter(
//       (x) => objs.findIndex((y) => y.id === x.id) === -1
//     )
//   }
// }

export default highlights
