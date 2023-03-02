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
import { WindowType } from "@/data/windowType"
import context from "@/stores/context"
import {
  all,
  filterA,
  filterMapA,
  filterRA,
  mapA,
  mapO,
  reduceA,
  reduceWithIndexRA,
  StrEq,
  StrOrd,
  upperFirst,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { findFirst, findFirstMap, getEq, replicate } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { range } from "fp-ts/lib/NonEmptyArray"
import {
  fromNullable,
  getOrElse,
  none,
  Option,
  some,
  toNullable,
} from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import {
  ColumnLayout,
  columnLayoutToDNA,
  columnLayoutToMatrix,
  columnMatrixToDna,
} from "./layouts"
import { useSide } from "./side"

export const getLevelNumber = (levelLetter: string) =>
  ["F", "G", "M", "T", "R"].findIndex((x) => x === levelLetter)

export const useGetVanillaModule = <T extends BareModule>(
  opts: { loadGLTF?: boolean } = {}
) => {
  const { loadGLTF = false } = opts
  const { modules: allModules } = useSystemsData()

  const bugMod = "W1-END-G1-GRID1-01-ST0-L0-SIDE0-SIDE0-END1-TOP0"

  return (
    module: T,
    opts: {
      positionType?: string
      levelType?: string
      constrainGridType?: boolean
    } = {}
  ) => {
    const { positionType, levelType, constrainGridType = true } = opts

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
          levelType
            ? sysModule.structuredDna.levelType === levelType
            : sysModule.structuredDna.levelType ===
                module.structuredDna.levelType,
          !constrainGridType ||
            sysModule.structuredDna.gridType === module.structuredDna.gridType
        )
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      mapO((m) => (loadGLTF ? loadModule(m) : m)),
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

export const usePadColumn = () => {
  const getVanillaModule = useGetVanillaModule()

  return <T extends BareModule = BareModule>(levels: T[][]) => {
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
}

export const useGetStairsModule = () => {
  const { modules: allModules } = useSystemsData()

  return <M extends BareModule = BareModule>(
    oldModule: M,
    opts: {
      stairsType?: StairType["code"]
      levelType?: string
    } = {}
  ) => {
    const { stairsType, levelType } = opts
    const constraints = keysFilter<M>(
      ["sectionType", "positionType", "gridType"],
      oldModule
    )

    const systemModules = pipe(
      allModules,
      filterRA((m) => m.systemId === oldModule.systemId)
    )

    return pipe(
      systemModules as unknown as M[],
      filterA(constraints),
      filterA(
        (x) =>
          x.structuredDna.stairsType ===
            (stairsType ?? oldModule.structuredDna.stairsType) &&
          (!levelType || x.structuredDna.levelType === levelType)
      ),
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

export type WindowOpt = {
  label: string
  value: { windowType: string; buildingDna: string[] }
}

export const useWindowOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: WindowOpt[]; selected: WindowOpt["value"] } => {
  const side = useSide(context.buildingId!)
  const systemModules = useSystemModules(module.systemId)
  const { windowTypes } = useSystemsData()

  const changeModule = useChangeModuleLayout(columnLayout, {
    columnIndex,
    levelIndex,
    groupIndex,
  })

  const options = pipe(
    systemModules as unknown as T[],
    filterA(
      keysFilter(
        [
          "sectionType",
          "positionType",
          "levelType",
          "stairsType",
          "internalLayoutType",
          "gridType",
          "gridUnits",
        ],
        module
      )
    ),
    filterMapA((m) =>
      pipe(
        windowTypes,
        findFirstMap((wt): Option<[T, WindowType]> => {
          switch (true) {
            case m.structuredDna.positionType === "END":
              return wt.code === m.structuredDna.windowTypeEnd
                ? some([m, wt])
                : none
            case side === "LEFT":
              return wt.code === m.structuredDna.windowTypeSide1 &&
                module.structuredDna.windowTypeSide2 ===
                  m.structuredDna.windowTypeSide2
                ? some([m, wt])
                : none

            case side === "RIGHT":
              return wt.code === m.structuredDna.windowTypeSide2 &&
                module.structuredDna.windowTypeSide1 ===
                  m.structuredDna.windowTypeSide1
                ? some([m, wt])
                : none
            default:
              return none
          }
        })
      )
    ),
    mapA(
      ([m, wt]): WindowOpt => ({
        label: wt.description,
        value: { buildingDna: changeModule(m), windowType: wt.code },
      })
    )
  )

  const eq = getEq(StrEq)

  const selected = pipe(
    options,
    findFirstMap(({ value }) => {
      const buildingDna = columnLayoutToDNA(columnLayout)
      return eq.equals(value.buildingDna, buildingDna) ? some(value) : none
    }),
    getOrElse(() => {
      throw new Error("Selected window option not found in options")
      return undefined as any
    })
  )

  return { options, selected }
}
