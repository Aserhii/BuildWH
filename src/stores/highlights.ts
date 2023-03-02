import { isMesh, ObjectRef } from "@/utils"
import { MutableRefObject } from "react"
import { AmbientLight, Group, Object3D } from "three"
import { proxy, ref, useSnapshot } from "valtio"

type Highights = {
  outlined: Array<Object3D>
  illuminated: Array<Object3D>
}
const highlights = proxy<Highights>({
  outlined: [],
  illuminated: [],
})

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
}

export const illuminateGroup = (
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
      if (highlights.illuminated.indexOf(next) === -1) changed = true
    }
  })

  if (changed && !remove) {
    highlights.illuminated = objs
  }

  if (remove) {
    highlights.illuminated = highlights.illuminated.filter(
      (x) => objs.findIndex((y) => y.id === x.id) === -1
    )
  }
}
export default highlights
