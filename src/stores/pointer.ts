import { proxy } from "valtio"

export const pointer = proxy({
  xz: [0, 0] as [number, number],
})

export const setXZ = ([x, z]: [number, number]) => {
  pointer.xz = [x, z]
}

export default pointer
