import { useSystemData } from "@/contexts/SystemsData"
import { LoadedIfcModule, Module } from "@/data/module"
import { modulesToRows, useHouses } from "@/stores/houses"
import {
  errorThrower,
  filterMapA,
  findFirstA,
  flattenA,
  mapA,
  mapWithIndexA,
  reduceA,
  reduceWithIndexA,
  transposeA,
  zipA,
} from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { match, none, some } from "fp-ts/lib/Option"
import produce from "immer"
import useIfcModels from "../useIfcModels"

export type PositionedModule = {
  module: LoadedIfcModule
  z: number
}

export type PositionedRow = {
  levelIndex: number
  levelType: string
  y: number
  modules: Readonly<Array<PositionedModule>>
  length: number
}

export type GridGroup = PositionedRow

export type RowLayout = Array<PositionedRow>

export type PositionedColumn = {
  gridGroups: Readonly<Array<PositionedRow>>
  z: number
  columnIndex: number
  length: number
}

export type ColumnLayout = Array<PositionedColumn>

export const useIfcBuildingModules = (buildingId: string) => {
  const { modules: sysModules } = useSystemData({ buildingId })
  const house = useHouses()[buildingId]

  const modules = pipe(
    [...house.dna],
    filterMapA((dna) =>
      pipe(
        sysModules,
        findFirstA(
          (sysM: Module) => sysM.systemId === house.systemId && sysM.dna === dna
        ),
        match(errorThrower(`no module found for ${dna}`), (x) => some(x))
      )
    )
  )

  const ifcModels = pipe(
    modules,
    filterMapA(({ ifcUrl, dna }) =>
      ifcUrl
        ? some(ifcUrl)
        : (errorThrower(`house type ${house.houseTypeId} no ifc for ${dna}`)(),
          none)
    ),
    useIfcModels
    // useIFC, wraps useLoader, takes array? Similar to useGLTF?
  )

  return modules.map((module, i) => ({
    ...module,
    ifcModel: ifcModels[i],
  }))
}

const analyzeColumn =
  <A extends unknown>(toLength: (a: A) => number) =>
  (as: A[][]) => {
    return pipe(
      as,
      reduceWithIndexA(
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

export const columnify =
  <A extends unknown>(toLength: (a: A) => number) =>
  (input: readonly A[][]) => {
    let slices = new Array<[number, number]>(input.length).fill([0, 1])
    const lengths = input.map((v) => v.length)

    let acc: A[][][] = []

    const slicesRemaining = () =>
      !pipe(
        zipA(slices)(lengths),
        reduceA(true, (acc, [length, [start]]) => acc && start > length - 1)
      )

    while (slicesRemaining()) {
      pipe(
        slices,
        mapWithIndexA((rowIndex, [start, end]) =>
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

    return pipe(acc, transposeA)
  }

export const useIfcColumnLayout = (id: string) => {
  const houseModules = useIfcBuildingModules(id)
  const rows = modulesToRows(houseModules)

  const columns = pipe(
    rows,
    mapA((row) =>
      pipe(
        row,
        // group by grid type
        reduceA(
          { prev: null, acc: [] },
          (
            {
              prev,
              acc,
            }: { prev: LoadedIfcModule | null; acc: LoadedIfcModule[][] },
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
    transposeA
  )

  const sameLengthColumns = pipe(
    columns,
    mapA((column) =>
      pipe(
        column,
        mapA((module) =>
          pipe(
            module,
            reduceA(0, (b, v) => b + v.structuredDna.gridUnits)
          )
        ),
        reduceA(
          { acc: true, prev: null },
          ({ prev }: { prev: number | null }, a: number) => ({
            acc: prev === null || prev === a,
            prev: a as number | null,
          })
        ),
        ({ acc }) => acc
      )
    ),
    reduceA(true, (b, a) => b && a)
  )

  if (!sameLengthColumns) throw new Error("not sameLengthColumns")

  const columnifiedFurther = pipe(
    columns,
    mapA((column) =>
      pipe(
        column,
        columnify((a) => a.structuredDna.gridUnits),
        transposeA
      )
    ),
    flattenA
  )

  return pipe(
    columnifiedFurther,
    reduceWithIndexA(
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
          reduceWithIndexA(
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
                  : positionedRows[levelIndex - 1].y +
                    positionedRows[levelIndex - 1].modules[0].module.height

              return [
                ...positionedRows,
                {
                  modules: pipe(
                    modules,
                    reduceWithIndexA(
                      [],
                      (
                        i,
                        positionedModules: PositionedModule[],
                        module: LoadedIfcModule
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
