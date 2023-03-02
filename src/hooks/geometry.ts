import houses from "@/stores/houses"
import { useRef } from "react"
import { Matrix4, Vector3 } from "three"

export const useRotateVector = (buildingId: string) => {
  const rotationMatrix = useRef(new Matrix4())

  return ([x0, z0]: [number, number]): [number, number] => {
    const vec = new Vector3(x0, 0, z0)
    rotationMatrix.current.makeRotationY(-houses[buildingId].rotation)
    vec.applyMatrix4(rotationMatrix.current)
    const [x1, , z1] = vec.toArray()
    return [x1, z1]
  }
}
