import { LoadedModule } from "@/data/module"
import { mapRA, reduceRA } from "@/utils"
import { transpose } from "fp-ts-std/ReadonlyArray"
import { pipe } from "fp-ts/lib/function"
import { reduceWithIndex } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useBuildingRows } from "./houses"

export type PositionedModule = {
  module: LoadedModule
  z: number
}

export type PositionedRow = {
  levelIndex: number
  levelType: string
  y: number
  modules: Readonly<Array<PositionedModule>>
}

export type RowLayout = Array<PositionedRow>

export type PositionedColumn = {
  gridGroups: Readonly<Array<PositionedRow>>
  z: number
  columnIndex: number
}

export type ColumnLayout = Array<PositionedColumn>

export const useRowLayout = (buildingId: string): RowLayout =>
  pipe(
    useBuildingRows(buildingId),
    mapRA((row) =>
      pipe(
        row,
        reduceWithIndex(
          [],
          (i, prevs: Array<PositionedModule>, module: LoadedModule) => {
            const isFirst: boolean = i === 0

            const z = isFirst
              ? module.length / 2
              : prevs[i - 1].z +
                prevs[i - 1].module.length / 2 +
                module.length / 2

            return [
              ...prevs,
              {
                module,
                z,
              },
            ]
          }
        )
      )
    ),
    reduceWithIndex(
      [],
      (
        i,
        b: {
          modules: Array<PositionedModule>
          y: number
          levelType: string
          levelIndex: number
        }[],
        row
      ) => {
        const levelType = row[0].module.structuredDna.levelType
        const levelLetter = levelType[0]
        const y =
          levelLetter === "F"
            ? -row[0].module.height
            : levelLetter === "G"
            ? 0
            : b[i - 1].y + row[0].module.height

        return [
          ...b,
          {
            modules: row,
            y,
            levelIndex: i,
            levelType: row[0].module.structuredDna.levelType,
          },
        ]
      }
    )
  )

export const useColumnLayout = (buildingId: string) => {
  // think you actually want to find
  // lowest denominator in terms of grid units,
  // per grid type column
  // then delineate again, so that columns are minimal

  const rows = useBuildingRows(buildingId)

  const columns = pipe(
    rows,
    mapRA((row) =>
      pipe(
        row,
        // group by grid type
        reduceRA(
          { prev: null, acc: [] },
          (
            { prev, acc }: { prev: LoadedModule | null; acc: LoadedModule[][] },
            module
          ) => ({
            acc:
              module.structuredDna.gridType === prev?.structuredDna.gridType
                ? produce(acc, (draft) => {
                    draft[draft.length - 1].push(module)
                  })
                : produce(acc, (draft) => {
                    draft[draft.length] = [module]
                  }),
            prev: module,
          })
        ),
        ({ acc }) => acc
      )
    ),
    transpose
  )

  const legit = pipe(
    columns,
    mapRA((column) =>
      pipe(
        column,
        mapRA((y) =>
          pipe(
            y,
            reduceRA(0, (b, a) => b + a.structuredDna.gridUnits)
          )
        ),
        reduceRA(
          { acc: true, prev: null },
          (
            { acc, prev }: { acc: boolean; prev: number | null },
            a: number
          ) => ({
            acc: prev === null || prev === a,
            prev: a as number | null,
          })
        ),
        ({ acc }) => acc
      )
    ),
    reduceRA(true, (b, a) => b && a)
  )

  if (!legit) throw new Error("not legit")

  return pipe(
    columns,
    reduceWithIndex(
      [],
      (columnIndex, positionedCols: PositionedColumn[], loadedModules) => {
        const last =
          columnIndex === 0 ? null : positionedCols[positionedCols.length - 1]
        const z = !last
          ? 0
          : last.z +
            last.gridGroups[0].modules.reduce(
              (modulesLength, module) => modulesLength + module.module.length,
              0
            )
        return [
          ...positionedCols,
          {
            columnIndex,
            gridGroups: pipe(
              loadedModules,
              reduceWithIndex(
                [],
                (levelIndex, positionedRows: PositionedRow[], modules) => {
                  const levelType = modules[0].structuredDna.levelType
                  const levelLetter = levelType[0]
                  const height = modules[0].height
                  const y =
                    levelLetter === "F"
                      ? -height
                      : levelLetter === "G"
                      ? 0
                      : positionedRows[levelIndex - 1].y + height

                  return [
                    ...positionedRows,
                    {
                      modules: pipe(
                        modules,
                        reduceWithIndex(
                          [],
                          (
                            i,
                            positionedModules: PositionedModule[],
                            module: LoadedModule
                          ) => {
                            const isFirst: boolean = i === 0

                            const z = isFirst
                              ? module.length / 2
                              : positionedModules[i - 1].z +
                                positionedModules[i - 1].module.length / 2 +
                                module.length / 2

                            return [
                              ...positionedModules,
                              {
                                module,
                                z,
                              },
                            ]
                          }
                        )
                      ),
                      levelIndex,
                      levelType,
                      y,
                    },
                  ]
                }
              )
            ),
            z,
          },
        ]
      }
    )
  )
}
