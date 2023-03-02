import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  ColumnModuleKey,
  filterCompatibleModules,
  keysFilter,
  Module,
  StructuredDnaModule,
  topCandidateByHamming,
  useChangeModuleLayout,
} from "@/data/module"
import { StairType } from "@/data/stairType"
import {
  all,
  filterA,
  filterMapA,
  filterRA,
  mapA,
  mapO,
  reduceA,
  reduceWithIndexRA,
  StrOrd,
  upperFirst,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { findFirst, replicate } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { range } from "fp-ts/lib/NonEmptyArray"
import { fromNullable, getOrElse, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import {
  ColumnLayout,
  columnLayoutToDNA,
  columnLayoutToMatrix,
  columnMatrixToDna,
} from "./layouts"

export const getLevelNumber = (levelLetter: string) =>
  ["F", "G", "M", "T", "R"].findIndex((x) => x === levelLetter)

export const useGetBareVanillaModule = <T extends BareModule>() => {
  const { modules: allModules } = useSystemsData()

  return (
    module: T,
    opts: { positionType?: string; levelLetter?: string } = {}
  ) => {
    const { positionType, levelLetter } = opts

    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    const vanillaModule = pipe(
      systemModules,
      filterRA((sysModule) =>
        all(
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType,
          positionType
            ? sysModule.structuredDna.positionType === positionType
            : sysModule.structuredDna.positionType ===
                module.structuredDna.positionType,
          levelLetter
            ? sysModule.structuredDna.level === getLevelNumber(levelLetter)
            : sysModule.structuredDna.levelType ===
                module.structuredDna.levelType
        )
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      toNullable
    )

    if (!vanillaModule)
      throw new Error(`No vanilla module found for ${module.dna}`)

    return vanillaModule
  }
}

export const useGetLoadedVanillaModule = <T extends BareModule>() => {
  const { modules: allModules } = useSystemsData()
  return (
    module: T,
    opts: { positionType?: string; levelLetter?: string } = {}
  ) => {
    const { positionType, levelLetter } = opts

    const systemModules = pipe(
      allModules,
      filterRA((m) => m.systemId === module.systemId)
    )

    const vanillaModule = pipe(
      systemModules,
      filterRA((sysModule) =>
        all(
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType,
          positionType
            ? sysModule.structuredDna.positionType === positionType
            : sysModule.structuredDna.positionType ===
                module.structuredDna.positionType,
          levelLetter
            ? sysModule.structuredDna.level === getLevelNumber(levelLetter)
            : sysModule.structuredDna.levelType ===
                module.structuredDna.levelType
        )
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      mapO(loadModule),
      toNullable
    )

    if (!vanillaModule)
      throw new Error(`No vanilla module found for ${module.dna}`)

    return vanillaModule
  }
}

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
}

type LayoutOpt = {
  label: string
  value: { module: Module; buildingDna: string[] }
}

export const useLayoutOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: LayoutOpt[]; selected: LayoutOpt["value"] } => {
  const systemModules = useSystemModules(module.systemId)

  const changeModuleLayout = useChangeModuleLayout(columnLayout, {
    columnIndex,
    levelIndex,
    groupIndex,
  })

  const options = pipe(
    systemModules,
    filterCompatibleModules([
      "sectionType",
      "positionType",
      "levelType",
      "gridType",
      "stairsType",
    ])(module),
    mapA((m) => ({
      label: pipe(
        m.description ?? "",
        upperFirst,
        getOrElse(() => m.dna)
      ),
      value: {
        module: m,
        buildingDna: changeModuleLayout(m),
      },
    }))
  )

  const { value: selected } = pipe(
    options,
    findFirst((x) => x.value.module.dna === module.dna),
    getOrElse(() => options[0])
  )

  return { options, selected }
}

export type StairsOpt = {
  label: string
  value: { stairType: string; buildingDna: string[] }
}

export const useStairsOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: StairsOpt[]; selected: StairsOpt["value"] } => {
  const { stairTypes, modules: systemModules } = useSystemsData()

  const getVanillaModule = useGetBareVanillaModule()

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

  const getStairsModule = <M extends StructuredDnaModule = StructuredDnaModule>(
    oldModule: M,
    stairType: StairType
  ) => {
    const constraints = keysFilter<M>(
      ["sectionType", "positionType", "levelType", "gridType"],
      oldModule
    )

    return pipe(
      systemModules as unknown as M[],
      filterA(constraints),
      filterA((x) => x.structuredDna.stairsType === stairType.code),
      (modules) =>
        topCandidateByHamming(
          [
            "internalLayoutType",
            "windowTypeSide1",
            "windowTypeSide2",
            "windowTypeEnd",
            "windowTypeTop",
          ],
          oldModule,
          modules
        )
    )
  }

  const options = pipe(
    stairTypes,
    reduceA(new Map<StairType["code"], StairsOpt>(), (acc, stairType) => {
      const newLevels = pipe(
        levelGroupIndices,
        filterMapA(([levelIdx, groupIdx]) => {
          return pipe(
            getStairsModule(
              columnMatrix[columnIndex][levelIdx][groupIdx],
              stairType
            ),
            fromNullable,
            mapO((newModule) =>
              produce(columnMatrix[columnIndex][levelIdx], (draft) => {
                draft[groupIdx] = newModule
              })
            )
          )

          // const oldModule: BareModule =
          //   columnMatrix[columnIndex][levelIdx][groupIdx]
          // const newModule =

          // if (newModule === null) return none

          // rewrite here

          // const gridUnitDiff =
          //   newModule.structuredDna.gridUnits -
          //   oldModule.structuredDna.gridUnits

          // return some({
          //   levelIdx,
          //   groupIdx,
          //   oldModule,
          //   newModule,
          //   gridUnitDiff,
          // })
        })
      )

      if (newLevels.length !== roofIndex - groundIndex + 1) {
        return acc
      }

      const newColumn = [columnMatrix[columnIndex][0], ...newLevels]

      const padColumn = <T extends BareModule = BareModule>(levels: T[][]) => {
        const target = pipe(
          levels,
          reduceA(0, (b, level) => {
            const x = pipe(
              level,
              reduceA(0, (c, m) => c + m.structuredDna.gridUnits)
            )
            return x > b ? x : b
          })
        )

        return pipe(
          levels,
          mapA((level) => {
            const levelLength = level.reduce(
              (acc, v) => acc + v.structuredDna.gridUnits,
              0
            )
            return [
              ...level,
              ...replicate(target - levelLength, getVanillaModule(level[0])),
            ]
          })
        )
      }

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
