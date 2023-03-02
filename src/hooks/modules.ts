import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  filterCompatibleModules,
  keysFilter,
  keysHammingSort,
  LoadedModule,
  Module,
} from "@/data/module"
import {
  filterA,
  filterRA,
  mapA,
  mapO,
  NumEq,
  NumOrd,
  reduceM,
  reduceRA,
  StrOrd,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { findFirst, Foldable } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { fromFoldable } from "fp-ts/lib/Map"
import { range } from "fp-ts/lib/NonEmptyArray"
import { getOrElse, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import { first } from "fp-ts/lib/Semigroup"
import produce from "immer"
import { ColumnLayout, columnLayoutToDNA } from "./layouts"

export const useGetVanillaModule = () => {
  const { modules: allModules } = useSystemsData()
  return (module: LoadedModule): LoadedModule | null => {
    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    return pipe(
      systemModules,
      filterRA(
        (sysModule) =>
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType &&
          sysModule.structuredDna.levelType ===
            module.structuredDna.levelType &&
          sysModule.structuredDna.positionType === "MID"
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
  }
}

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
}

export type ColumnModuleKey = {
  columnIndex: number
  levelIndex: number
  groupIndex: number
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

  const options = pipe(
    systemModules,
    filterCompatibleModules([
      "sectionType",
      "positionType",
      "levelType",
      "gridType",
      "gridUnits",
      "stairsType",
    ])(module),
    mapA((module) => ({
      label: module.dna,
      value: {
        module,
        buildingDna: pipe(
          columnLayout,
          produce((draft) => {
            draft[columnIndex].gridGroups[levelIndex].modules[
              groupIndex
            ].module.dna = module.dna
          }),
          columnLayoutToDNA
        ) as string[],
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

export const stairsMe = <M extends BareModule>(
  module: M,
  modules: M[],
  stairsType: string
) =>
  pipe(
    modules,
    filterA(
      keysFilter(
        ["sectionType", "positionType", "levelType", "gridType", "gridUnits"],
        module
      )
    ),
    filterA((x) => x.structuredDna.stairsType === stairsType),
    keysHammingSort(
      [
        "internalLayoutType",
        "windowTypeSide1",
        "windowTypeSide2",
        "windowTypeTop",
        "windowTypeEnd",
      ],
      module
    )
  )

type StairsOpt = {
  label: string
  value: { stairsType: string; buildingDna: string[] }
}

export const useStairsOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: StairsOpt[]; selected: StairsOpt } => {
  const systemModules = useSystemModules(module.systemId)

  // need this _for each_ module

  // you only need to hamming sort if you have multiple options
  // (NEA probably has a "lowest of comparison" or some such)

  // make `selected` first

  const selected: StairsOpt = {
    label: module.structuredDna.stairsType,
    value: {
      stairsType: module.structuredDna.stairsType,
      buildingDna: columnLayoutToDNA(columnLayout),
    },
  }

  const roofIndex = columnLayout[columnIndex].gridGroups.length - 1
  const groundIndex = 1

  const targetGridUnits = columnLayout[columnIndex].gridGroups
    .slice(0, groupIndex)
    .reduce(
      (acc, { modules }) =>
        acc +
        modules.reduce((bcc, w) => bcc + w.module.structuredDna.gridUnits, 0),
      0
    )

  const levelModulesMap = pipe(
    range(groundIndex, roofIndex),
    mapA((i) =>
      pipe(
        columnLayout[columnIndex].gridGroups[i].modules,
        reduceRA(
          { gridUnits: 0, module: null },
          (
            acc: { gridUnits: number; module: LoadedModule | null },
            { module }
          ) => {
            const nextGridUnits = acc.gridUnits + module.structuredDna.gridUnits
            return {
              gridUnits: nextGridUnits,
              module: acc.gridUnits === targetGridUnits ? module : acc.module,
            }
          }
        ),
        ({ module }) => {
          if (module === null)
            throw new Error(
              "Appropriate stairs module not found where expected"
            )
          return [i, module] as [number, LoadedModule]
        }
      )
    ),
    fromFoldable(NumEq, first<LoadedModule>(), Foldable)
  )

  // ensure stairs type consistency across level
  pipe(
    levelModulesMap,
    reduceM(NumOrd)(module.structuredDna.stairsType, (acc, v) => {
      if (v.structuredDna.stairsType !== acc)
        throw new Error("Inconsistent stairs type at different level")
      return acc
    })
  )

  // rewrite from here

  // maybe find the stairs types that the selected has available
  // (separate function)

  // then create a record or map of those stairs types to
  // levelModulesMaps
  // filter where those maps have no module candidates

  // levelModulesMap : Map<number,Module>
  // some kinda filter map to like
  // stairsType
  const options = pipe(
    levelModulesMap,
    reduceM(NumOrd)({}, (acc, v) => {
      return acc
    })
  )

  // const constraints = keysFilter<BareModule>(
  //   ["sectionType", "positionType", "levelType", "gridType", "gridUnits"],
  //   module
  // )

  // const compatMods = pipe(systemModules, filterA(constraints))

  // const stairsTypeOptions = pipe(compatMods, (xs) =>
  //   isNonEmpty(xs)
  //     ? pipe(
  //         xs,
  //         groupBy((module) => module.structuredDna.stairsType)
  //       )
  //     : {}
  // )

  return undefined as any
}
