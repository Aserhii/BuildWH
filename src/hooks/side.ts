import camera from "@/stores/camera"
import houses from "@/stores/houses"
import { Matrix4, Vector3 } from "three"

export type Side = "LEFT" | "RIGHT"

export const useSide = (buildingId: string): Side => {
  const houseDirection = (() => {
    const vec = new Vector3(0, 0, -1)
    const rotationMatrix = new Matrix4().makeRotationY(
      houses[buildingId].rotation
    )
    vec.applyMatrix4(rotationMatrix)
    return vec
  })()

  const cameraDirection = (() => {
    if (!camera.controls) throw new Error("No camera controls")
    const target = new Vector3()
    camera.controls.getTarget(target)
    return target
  })()

  const v = new Vector3()
  v.crossVectors(houseDirection, cameraDirection)
  return v.y < 0 ? "LEFT" : "RIGHT"
}
