import { isMesh, ObjectRef } from "@/utils"
import { MutableRefObject } from "react"
import { AmbientLight, Group } from "three"
import { proxy, ref, useSnapshot } from "valtio"

type Highights = {
  outlined: Array<ObjectRef>
  illuminated: Array<ObjectRef>
  bloomLightRef: AmbientLight | null
}
const highlights = proxy<Highights>({
  outlined: [],
  illuminated: [],
  bloomLightRef: null,
})

export const useBloomLightRef = () => {
  const { bloomLightRef } = useSnapshot(highlights)
  return bloomLightRef
}

export const useOutlined = () =>
  useSnapshot(highlights).outlined as Array<ObjectRef>
export const useIlluminated = () =>
  useSnapshot(highlights).illuminated as Array<ObjectRef>

export const outlineGroup = (
  groupRef: MutableRefObject<Group | undefined>,
  opts: { remove: boolean } = { remove: false }
) => {
  if (!groupRef.current) return

  const { remove = false } = opts
  const objectRefs: Array<ObjectRef> = []

  let changed = false
  groupRef.current.traverse((o3) => {
    if (isMesh(o3)) {
      const next = { current: o3 }
      objectRefs.push(ref(next))
      if (highlights.outlined.indexOf(next) === -1) changed = true
    }
  })

  if (changed && !remove) {
    highlights.outlined = objectRefs
  }

  if (remove) {
    highlights.outlined = highlights.outlined.filter(
      (x) => objectRefs.findIndex((y) => y.current.id === x.current.id) === -1
    )
  }
}

export const illuminateGroup = (
  groupRef: MutableRefObject<Group | undefined>,
  opts: { remove: boolean } = { remove: false }
) => {
  if (!groupRef.current) return

  const { remove = false } = opts
  const objectRefs: Array<ObjectRef> = []

  let changed = false
  groupRef.current.traverse((o3) => {
    if (isMesh(o3)) {
      const next = { current: o3 }
      objectRefs.push(ref(next))
      if (highlights.illuminated.indexOf(next) === -1) changed = true
    }
  })

  if (changed && !remove) {
    highlights.illuminated = [...highlights.illuminated, ...objectRefs]
  }

  if (remove) {
    highlights.illuminated = highlights.illuminated.filter(
      (x) => objectRefs.findIndex((y) => y.current.id === x.current.id) === -1
    )
  }
}

export default highlights
