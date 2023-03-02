import houses from "@/stores/houses"
import { useVerticalCuts } from "@/stores/settings"
import { filterMapWithIndexR } from "@/utils"
import { values } from "fp-ts-std/Record"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import { useMemo } from "react"
import { Plane, Vector3 } from "three"
import { ColumnLayout } from "./layouts"

export const useVerticalCutPlanes = (
  columns: ColumnLayout,
  buildingId: string
) => {
  const [cuts] = useVerticalCuts()

  const buildingLength = columns.reduce((acc, v) => acc + v.length, 0)
  const lengthMiddle = buildingLength / 2 + houses[buildingId].position[1]
  const widthMiddle = houses[buildingId].position[0]

  const lengthPlane = useMemo(
    () => new Plane(new Vector3(0, 0, 1), -lengthMiddle),
    []
  )

  const widthPlane = useMemo(
    () => new Plane(new Vector3(1, 0, 0), widthMiddle),
    []
  )

  return pipe(
    cuts,
    filterMapWithIndexR((k, b) =>
      b ? some(k === "length" ? lengthPlane : widthPlane) : none
    ),
    values
  )
}
