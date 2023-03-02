import { BareModule } from "@/data/module"
import houses from "@/stores/houses"
import { flattenA, mapA, transposeA } from "@/utils"
import { lookup, replicate } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { columnMatrixToDna, rowMatrixToDna, useColumnMatrix } from "./layouts"
import {
  useGetStairsModule,
  useGetVanillaModule,
  usePadColumn,
} from "./modules"

export const useLevelInteractions = (
  buildingId: string,
  levelIndex: number,
  onComplete?: () => void
) => {
  const columnMatrix = useColumnMatrix<BareModule>(buildingId)

  const getVanillaModule = useGetVanillaModule()
  const getStairsModule = useGetStairsModule()
  const padColumn = usePadColumn()

  const getLevel = (i: number) =>
    pipe(columnMatrix, transposeA, lookup(i), toNullable)

  const thisLevel = getLevel(levelIndex)
  const nextLevel = getLevel(levelIndex + 1)

  if (thisLevel === null) throw new Error("thisLevel null")

  const thisLevelLetter = thisLevel[0][0].structuredDna.levelType[0]
  const nextLevelLetter = nextLevel?.[0][0].structuredDna.levelType[0]

  const targetLevelLetter = nextLevelLetter === "R" ? "T" : "M"
  const targetLevelType = targetLevelLetter + "1"

  const canAddFloorAbove =
    nextLevel !== null && ["R", "M", "T"].includes(targetLevelLetter)

  const canRemoveFloor = ["M", "T"].includes(thisLevelLetter)

  const addFloorAbove = () => {
    if (!canAddFloorAbove) return

    // what's the algorithm?

    // how about just do it vanilla and then do a change stairs separately?

    houses[buildingId].dna = pipe(
      columnMatrix,
      transposeA,
      (rows) => [
        ...rows.slice(0, levelIndex + 1),
        pipe(
          rows[levelIndex],
          mapA((group) =>
            pipe(
              group,
              mapA((m) => {
                const vanillaModule = getVanillaModule(m, {
                  levelType: targetLevelType,
                })
                if (m.structuredDna.stairsType === "ST0")
                  return replicate(
                    m.structuredDna.gridUnits /
                      vanillaModule.structuredDna.gridUnits,
                    vanillaModule
                  )
                const stairsModule = getStairsModule(m, {
                  levelType: targetLevelType,
                })
                if (!stairsModule)
                  throw new Error(
                    `No stairs module found for ${m.dna} level ${targetLevelLetter}`
                  )
                return [stairsModule]
              }),
              flattenA
            )
          )
        ),
        ...rows.slice(levelIndex + 1),
      ],
      transposeA,
      mapA(padColumn),
      columnMatrixToDna
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
