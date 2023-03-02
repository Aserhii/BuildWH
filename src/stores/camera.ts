import { useRotateVector } from "@/hooks/geometry"
import CameraControls from "camera-controls"
import { pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import { useEffect } from "react"
import { Vector3 } from "three"
import { proxy } from "valtio"
import { useSiteContext } from "./context"
import { useHouses, useMaybeBuildingLength } from "./houses"

type CameraProxy = {
  controls: CameraControls | null
  lastLookAt: V6
}

export const defaultCamPos: [number, number, number] = [-12, 24, -12]
export const defaultCamTgt: [number, number, number] = [0, 0, 0]

const camera = proxy<CameraProxy>({
  controls: null,
  lastLookAt: [...defaultCamPos, ...defaultCamTgt],
})

export const setCameraEnabled = (b: boolean) => {
  if (camera.controls) camera.controls.enabled = b
}

export const useCameraFocus = () => {
  const houses = useHouses()
  const { buildingId } = useSiteContext()
  const house = buildingId ? houses[buildingId] : null

  const buildingLength = pipe(
    useMaybeBuildingLength(buildingId),
    getOrElse(() => 0)
  )

  const rotateVector = useRotateVector(buildingId)

  useEffect(() => {
    if (!camera.controls) return

    setCameraEnabled(true)

    if (!house) {
      camera.controls.setLookAt(...camera.lastLookAt, true)
    } else {
      const {
        position: [x0, z0],
      } = house
      const [mx, mz] = rotateVector([0, buildingLength / 2])
      const [x, z] = [x0 + mx, z0 + mz]
      const v3Pos = new Vector3()
      const v3Tgt = new Vector3()
      camera.controls.getPosition(v3Pos)
      camera.controls.getTarget(v3Tgt)
      camera.lastLookAt = [...v3Pos.toArray(), ...v3Tgt.toArray()]
      camera.controls.setLookAt(x - 12, 24, z - 12, x, 0, z, true)
    }
  }, [buildingId])
}

export const useCameraReset = () => {
  return () => {
    if (!camera.controls) return
    camera.controls.setLookAt(...defaultCamPos, ...defaultCamTgt, true)
    camera.controls.zoomTo(1, true)
  }
}

export default camera
