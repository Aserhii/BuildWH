import { Mesh } from "three"
import { proxy } from "valtio"

type PointerStore = {
  xz: [number, number]
  planeMesh: Mesh | null
}

export const pointer = proxy<PointerStore>({
  xz: [0, 0] as [number, number],
  planeMesh: null,
})

export const setXZ = ([x, z]: [number, number]) => {
  pointer.xz = [x, -z]
}

export default pointer
