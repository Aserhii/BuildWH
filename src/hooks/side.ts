import camera from "@/stores/camera"
import houses from "@/stores/houses"
import { useMemo } from "react"
import { Matrix4, Vector3 } from "three"
import { useSnapshot } from "valtio"

export type Side = "LEFT" | "RIGHT"

export const useSide = (buildingId: string) => {
  const { rotation } = useSnapshot(houses[buildingId])

  const houseDirection = useMemo(() => {
    const vec = new Vector3(0, 0, -1)
    const rotationMatrix = new Matrix4().makeRotationY(
      houses[buildingId].rotation
    )
    vec.applyMatrix4(rotationMatrix)
    return vec
  }, [rotation])

  const cameraDirection = new Vector3()

  return (): Side => {
    camera.controls?.camera.getWorldDirection(cameraDirection)
    const v = new Vector3()
    v.crossVectors(houseDirection, cameraDirection)
    return v.y < 0 ? "LEFT" : "RIGHT"
  }
}
