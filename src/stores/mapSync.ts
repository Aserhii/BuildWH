import { ReconcilerRoot } from "@react-three/fiber"
import mapboxgl from "mapbox-gl"
import { proxy, ref, useSnapshot } from "valtio"
import * as z from "zod"
import CameraSync from "../threebox/camera/CameraSync"

const interactions = z.enum([
  "scrollZoom",
  "boxZoom",
  "dragRotate",
  "dragPan",
  "keyboard",
  "doubleClickZoom",
  "touchZoomRotate",
])

const mapSync = proxy<{
  map: mapboxgl.Map | null
  cameraSync: CameraSync | null
  r3fRoot: ReconcilerRoot<HTMLCanvasElement> | null
}>({
  map: null,
  r3fRoot: null,
  cameraSync: null,
})

export const setMapSyncMap = (map: mapboxgl.Map) => {
  mapSync.map = ref(map)
}
export const setR3FRoot = (root: ReconcilerRoot<HTMLCanvasElement>) => {
  mapSync.r3fRoot = ref(root)
}

export const useMapSyncMap = () => {
  const { map: mapSyncMap } = useSnapshot(mapSync)
  return [mapSyncMap, setMapSyncMap] as const
}

export const useR3FRoot = () => {
  const { r3fRoot } = useSnapshot(mapSync)
  return [r3fRoot, setR3FRoot] as const
}

export const useInteractions = () => {
  const enableInteractions = () => {
    const map = mapSync.map
    if (!map) return

    for (let interaction of interactions.options) {
      if (!map[interaction].isEnabled()) map[interaction].enable()
    }
  }

  const disableInteractions = () => {
    const map = mapSync.map
    if (!map) return

    for (let interaction of interactions.options) {
      if (map[interaction].isEnabled()) map[interaction].disable()
    }
  }
  return [enableInteractions, disableInteractions] as const
}

export default mapSync