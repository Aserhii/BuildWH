import { BareModule } from "@/data/module"
import houses from "@/stores/houses"
import { flattenA, mapA, transposeA } from "@/utils"
import { lookup } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { rowMatrixToDna, useColumnMatrix } from "./layouts"
import { useGetBareVanillaModule } from "./modules"

export const useLevelInteractions = (
  buildingId: string,
  levelIndex: number,
  onComplete?: () => void
) => {
  const columnMatrix = useColumnMatrix<BareModule>(buildingId)

  const getVanillaModule = useGetBareVanillaModule()

  const getLevel = (i: number) =>
    pipe(columnMatrix, transposeA, lookup(i), toNullable)

  const thisLevel = getLevel(levelIndex)
  const nextLevel = getLevel(levelIndex + 1)

  if (thisLevel === null) throw new Error("thisLevel null")

  const thisLevelLetter = thisLevel[0][0].structuredDna.levelType[0]
  const nextLevelLetter = nextLevel?.[0][0].structuredDna.levelType[0]

  const targetLevelLetter = nextLevelLetter === "R" ? "T" : "M"

  const canAddFloorAbove =
    nextLevel !== null && ["R", "M", "T"].includes(targetLevelLetter)

  const canRemoveFloor = ["M", "T"].includes(thisLevelLetter)

  const addFloorAbove = () => {
    if (!canAddFloorAbove) return

    houses[buildingId].dna = pipe(
      columnMatrix,
      transposeA,
      (rows) => [
        ...rows.slice(0, levelIndex + 1),
        pipe(
          rows[levelIndex],
          mapA(mapA((m) => getVanillaModule(m, targetLevelLetter)))
        ),
        ...rows.slice(levelIndex + 1),
      ],
      mapA(flattenA),
      rowMatrixToDna
    )
    onComplete?.()
  }
  const removeFloor = () => {
    if (!canRemoveFloor) return

    houses[buildingId].dna = pipe(
      columnMatrix,
      transposeA,
      (rows) => [...rows.slice(0, levelIndex), ...rows.slice(levelIndex + 1)],
      mapA(flattenA),
      rowMatrixToDna
    )
    onComplete?.()
  }

  return {
    addFloorAbove,
    removeFloor,
    canAddFloorAbove,
    canRemoveFloor,
  }
}
