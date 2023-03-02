import { ColorRepresentation } from "three"
import { proxy } from "valtio"

type DebugPlane = {
  position: [number, number, number]
  rotation: [number, number, number]
  width?: number
  height?: number
  color?: ColorRepresentation
}

type Debug = {
  planes: { [key: string]: DebugPlane }
}

const debug = proxy<Debug>({
  planes: {},
})

export const addDebugPlaneZ = (key: string, z: number) => {
  const colors = [
    "red",
    "green",
    "blue",
    "pink",
    "orange",
    "brown",
    "purple",
    "yellow",
  ]
  debug.planes[key] = {
    position: [0, 0, z],
    rotation: [0, 0, 0],
    color: colors[Math.floor(Math.random() * colors.length)],
  }
}

export default debug
