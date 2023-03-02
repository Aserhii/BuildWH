import { BareModule, LoadedModule, StructuredDnaModule } from "@/data/module"
import {
  flattenA,
  mapA,
  mapRA,
  mapWithIndexRA,
  reduceRA,
  reduceWithIndexRA,
  transposeA,
  zipRA,
} from "@/utils"
import { transpose } from "fp-ts-std/ReadonlyArray"
import { flow, pipe } from "fp-ts/lib/function"
import { flatten, reduceWithIndex } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useBuildingRows } from "../stores/houses"

export type PositionedModule = {
  module: LoadedModule
  z: number
}

export type PositionedRow = {
  levelIndex: number
  levelType: string
  y: number
  modules: Readonly<Array<PositionedModule>>
  length: number
}

export type RowLayout = Array<PositionedRow>

export type PositionedColumn = {
  gridGroups: Readonly<Array<PositionedRow>>
  z: number
  columnIndex: number
  length: number
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
          length: number
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
            length: row.reduce((acc, m) => acc + m.module.length, 0),
          },
        ]
      }
    )
  )

const analyzeColumn =
  <A extends unknown>(toLength: (a: A) => number) =>
  (as: readonly A[][]) => {
    return pipe(
      as,
      reduceWithIndexRA(
        { legit: true, target: -1, rows: [] },
        (
          index,
          {
            rows,
            legit,
            target,
          }: {
            rows: { units: number; index: number }[]
            legit: boolean
            target: number
          },
          row: A[]
        ) => {
          const units = row.reduce((acc, a) => acc + toLength(a), 0)
          return {
            rows: [...rows, { units, index }],
            legit: legit && (target === -1 || target === units),
            target: target === -1 ? units : Math.max(target, units),
          }
        }
      )
    )
  }

const columnify =
  <A extends unknown>(toLength: (a: A) => number) =>
  (input: readonly A[][]) => {
    let slices = new Array<[number, number]>(input.length).fill([0, 1])
    const lengths = input.map((v) => v.length)

    let acc: (readonly A[][])[] = []

    const slicesRemaining = () =>
      !pipe(
        zipRA(slices)(lengths),
        reduceRA(true, (acc, [length, [start]]) => acc && start > length - 1)
      )

    while (slicesRemaining()) {
      pipe(
        slices,
        mapWithIndexRA((rowIndex, [start, end]) =>
          input[rowIndex].slice(start, end)
        ),
        (column) =>
          pipe(column, analyzeColumn(toLength), ({ rows, legit, target }) => {
            if (legit) {
              acc = [...acc, column]
              slices = slices.map(([, end]) => [end, end + 1])
            } else {
              slices = slices.map(([start, end], i) =>
                rows[i].units === target ? [start, end] : [start, end + 1]
              )
            }
          })
      )
    }

    return pipe(acc, transpose)
  }

export const useColumnLayout = (buildingId: string) => {
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
              module.structuredDna.positionType ===
                prev?.structuredDna.positionType &&
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

  const sameLengthColumns = pipe(
    columns,
    mapRA((column) =>
      pipe(
        column,
        mapRA((module) =>
          pipe(
            module,
            reduceRA(0, (b, v) => b + v.structuredDna.gridUnits)
          )
        ),
        reduceRA(
          { acc: true, prev: null },
          ({ prev }: { prev: number | null }, a: number) => ({
            acc: prev === null || prev === a,
            prev: a as number | null,
          })
        ),
        ({ acc }) => acc
      )
    ),
    reduceRA(true, (b, a) => b && a)
  )

  if (!sameLengthColumns) throw new Error("not sameLengthColumns")

  const columnifiedFurther = pipe(
    columns,
    mapRA((column) =>
      pipe(
        column,
        columnify((a) => a.structuredDna.gridUnits),
        transpose
      )
    ),
    flatten
  )

  return pipe(
    columnifiedFurther,
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

        const gridGroups = pipe(
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
                  length: modules.reduce((acc, m) => acc + m.length, 0),
                },
              ]
            }
          )
        )
        return [
          ...positionedCols,
          {
            columnIndex,
            gridGroups,
            z,
            length: gridGroups[0].length,
          },
        ]
      }
    )
  )
}

export const columnLayoutToDNA = (
  columnLayout: Omit<PositionedColumn, "length" | "z" | "columnIndex">[]
) =>
  pipe(
    columnLayout,
    mapRA(({ gridGroups }) =>
      pipe(
        gridGroups,
        mapRA(({ modules }) =>
          pipe(
            modules,
            mapRA(({ module }) => module.dna)
          )
        )
      )
    ),
    transpose,
    flatten,
    flatten
  ) as string[]

export const columnLayoutToMatrix = <
  T extends StructuredDnaModule = StructuredDnaModule
>(
  columnLayout: ColumnLayout
): T[][][] => {
  return pipe(
    columnLayout,
    mapRA((column) =>
      pipe(
        column.gridGroups,
        mapRA((gridGroup) =>
          pipe(
            gridGroup.modules,
            mapRA(({ module }) => module)
          )
        )
      )
    )
  ) as unknown as T[][][]
}

export const columnMatrixToDna = <T extends BareModule = BareModule>(
  columnMatrix: T[][][]
) =>
  pipe(
    columnMatrix,
    mapA(mapA(mapA((x) => x.dna))),
    transposeA,
    flattenA,
    flattenA
  )

export const useColumnMatrix = <
  T extends StructuredDnaModule = StructuredDnaModule
>(
  buildingId: string
) => {
  const columnLayout = useColumnLayout(buildingId)
  return columnLayoutToMatrix<T>(columnLayout)
}

export const rowLayoutToMatrix = <
  T extends StructuredDnaModule = StructuredDnaModule
>(
  rowLayout: RowLayout
): T[][] =>
  pipe(
    rowLayout,
    mapA(({ modules }) =>
      pipe(
        modules,
        mapRA(({ module }) => module)
      )
    )
  ) as unknown as T[][]

export const useRowMatrix = <
  T extends StructuredDnaModule = StructuredDnaModule
>(
  buildingId: string
): T[][] => {
  const rowLayout = useRowLayout(buildingId)
  return rowLayoutToMatrix<T>(rowLayout)
}

export const rowMatrixToDna = <T extends BareModule = BareModule>(
  rowMatrix: T[][]
): string[] =>
  pipe(
    rowMatrix,
    flattenA,
    mapA((x) => x.dna)
  )
