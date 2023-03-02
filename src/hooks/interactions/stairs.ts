import { useSystemsData } from "@/contexts/SystemsData"
import { BareModule, ColumnModuleKey, StructuredDnaModule } from "@/data/module"
import { StairType } from "@/data/stairType"
import { filterMapA, mapA, mapO, reduceA, reduceWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { range } from "fp-ts/lib/NonEmptyArray"
import { fromNullable } from "fp-ts/lib/Option"
import produce from "immer"
import {
  ColumnLayout,
  columnLayoutToDNA,
  columnLayoutToMatrix,
  columnMatrixToDna,
} from "../layouts"
import { useGetStairsModule, usePadColumn } from "../modules"
export type StairsOpt = {
  label: string
  value: { stairType: string; buildingDna: string[] }
  thumbnail?: string
}

export const useStairsOptions = <T extends BareModule>(
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: StairsOpt[]; selected: StairsOpt["value"] } => {
  const module = columnLayout[columnIndex].gridGroups[levelIndex].modules[
    groupIndex
  ].module as unknown as T

  const { stairTypes, modules: systemModules } = useSystemsData()

  const getStairsModule = useGetStairsModule()
  const padColumn = usePadColumn()

  const selected: StairsOpt["value"] = {
    stairType: module.structuredDna.stairsType,
    buildingDna: columnLayoutToDNA(columnLayout),
  }

  const columnMatrix = columnLayoutToMatrix<BareModule>(columnLayout)

  const roofIndex = columnLayout[columnIndex].gridGroups.length - 1
  const groundIndex = 1

  const targetGridUnits = columnMatrix[columnIndex][levelIndex]
    .slice(0, groupIndex)
    .reduce((acc, m) => acc + m.structuredDna.gridUnits, 0)

  const levelGroupIndices = pipe(
    range(groundIndex, roofIndex),
    mapA((levelIdx) =>
      pipe(
        columnMatrix[columnIndex][levelIdx],
        reduceWithIndexRA(
          { groupIndex: 0, gridUnits: 0, module: null },
          (
            i,
            acc: {
              groupIndex: number
              gridUnits: number
              module: StructuredDnaModule | null
            },
            module
          ) => {
            const nextGridUnits = acc.gridUnits + module.structuredDna.gridUnits
            const nextModule =
              acc.module === null && acc.gridUnits === targetGridUnits
                ? module
                : acc.module
            return {
              gridUnits: nextGridUnits,
              module: nextModule,
              groupIndex: nextModule === null ? i : acc.groupIndex, // maybe +1?
            }
          }
        ),
        ({ groupIndex }) => {
          if (module === null)
            throw new Error(
              "Appropriate stairs module not found where expected"
            )
          return [levelIdx, groupIndex] as [number, number]
        }
      )
    )
  )

  const options = pipe(
    stairTypes,
    reduceA(new Map<StairType["code"], StairsOpt>(), (acc, stairType) => {
      const newLevels = pipe(
        levelGroupIndices,
        filterMapA(([levelIdx, groupIdx]) => {
          return pipe(
            getStairsModule(columnMatrix[columnIndex][levelIdx][groupIdx], {
              stairsType: stairType.code,
            }),
            fromNullable,
            mapO((newModule) =>
              produce(columnMatrix[columnIndex][levelIdx], (draft) => {
                draft[groupIdx] = newModule
              })
            )
          )
        })
      )

      if (newLevels.length !== roofIndex - groundIndex + 1) {
        return acc
      }

      const newColumn = [columnMatrix[columnIndex][0], ...newLevels]

      if (newLevels.length === roofIndex - groundIndex + 1) {
        acc.set(
          stairType.code,
          pipe(
            columnMatrix,
            produce((draft) => {
              draft[columnIndex] = padColumn(newColumn)
            }),
            columnMatrixToDna,
            (dna) => ({
              label:
                stairTypes.find((x) => x.code === stairType.code)
                  ?.description ?? stairType.code,
              value: { buildingDna: dna, stairType: stairType.code },
              thumbnail: stairType.imageUrl,
            })
          )
        )
      }

      return acc
    }),
    (map) => Array.from(map.values())
  )

  return { options, selected }
}
