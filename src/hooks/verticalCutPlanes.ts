import houses from "@/stores/houses"
import { useVerticalCuts } from "@/stores/settings"
import { filterMapWithIndexR } from "@/utils"
import { values } from "fp-ts-std/Record"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import { useMemo } from "react"
import { Matrix4, Plane, Vector3 } from "three"
import { useSnapshot } from "valtio"
import { ColumnLayout } from "./layouts"

export const useVerticalCutPlanes = (
  columns: ColumnLayout,
  buildingId: string
) => {
  const [cuts] = useVerticalCuts()

  const house = useSnapshot(houses[buildingId])

  const {
    position: [x, z],
    rotation,
  } = house

  const buildingLength = columns.reduce((acc, v) => acc + v.length, 0)
  const lengthMiddle = buildingLength / 2 + z
  const widthMiddle = x

  const rotationMatrix = new Matrix4().makeRotationY(rotation)
  const translationMatrix = new Matrix4().makeTranslation(
    widthMiddle,
    0,
    lengthMiddle
  )

  const total = translationMatrix.multiply(rotationMatrix)

  const lengthPlane = useMemo(() => {
    const plane = new Plane(new Vector3(0, 0, 1), 0)
    plane.applyMatrix4(total)
    return plane
  }, [total, x, z, rotation])

  const widthPlane = useMemo(() => {
    const plane = new Plane(new Vector3(1, 0, 0), 0)
    plane.applyMatrix4(total)
    return plane
  }, [total, x, z, rotation])

  return pipe(
    cuts,
    filterMapWithIndexR((k, b) =>
      b ? some(k === "length" ? lengthPlane : widthPlane) : none
    ),
    values
  )
}
