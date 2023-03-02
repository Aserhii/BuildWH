import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  ColumnModuleKey,
  filterCompatibleModules,
  keysFilter,
  topCandidateByHamming,
} from "@/data/module"
import houses from "@/stores/houses"
import { filterA, flattenA, mapA, StrEq, StrOrd, transposeA } from "@/utils"
import {
  filterMap,
  findFirstMap,
  lookup,
  replicate,
  sort,
  uniq,
} from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import produce from "immer"
import {
  ColumnLayout,
  columnLayoutToMatrix,
  columnMatrixToDna,
  rowMatrixToDna,
  useColumnMatrix,
} from "../layouts"
import {
  useGetStairsModule,
  useGetVanillaModule,
  usePadColumn,
  useSystemModules,
} from "../modules"

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

export type LevelTypeOpt = {
  label: string
  value: { levelType: string; buildingDna: string[] }
}

export const useLevelTypeOptions = (
  buildingId: string,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): {
  options: LevelTypeOpt[]
  selected: LevelTypeOpt["value"]
  levelString: string
} => {
  const systemModules = useSystemModules(houses[buildingId].systemId)

  const padColumn = usePadColumn()

  const columnMatrix = columnLayoutToMatrix<BareModule>(columnLayout)

  const rowMatrix = transposeA(columnMatrix)

  const thisLevel = rowMatrix[levelIndex]

  const thisModule =
    columnLayout[columnIndex].gridGroups[levelIndex].modules[groupIndex].module

  const thisLevelType = thisModule.structuredDna.levelType

  const { levelTypes: systemLevelTypes } = useSystemsData()

  const levelTypes = pipe(
    systemLevelTypes,
    filterA((lt) => lt.systemId === thisModule.systemId)
  )

  const getDescription = (levelType: string) =>
    pipe(
      levelTypes,
      findFirstMap((lt) =>
        lt.code === levelType ? some(lt.description) : none
      ),
      getOrElse(() => "")
    )

  const selectedOption: LevelTypeOpt = {
    label: getDescription(thisLevelType),
    value: {
      buildingDna: columnMatrixToDna(columnMatrix),
      levelType: thisLevelType,
    },
  }

  const otherOptions = pipe(
    systemModules,
    filterCompatibleModules(["sectionType", "positionType", "level"])(
      thisModule
    ),
    mapA((x) => x.structuredDna.levelType),
    uniq(StrEq),
    filterMap((levelType) => {
      if (levelType === thisLevelType) return none

      let fail = false

      const newLevel = pipe(
        thisLevel,
        mapA((gridGroup) =>
          pipe(
            gridGroup,
            mapA((module) =>
              pipe(
                systemModules as BareModule[],
                filterA(
                  keysFilter(
                    ["sectionType", "positionType", "levelType", "gridType"],
                    produce(module, (draft) => {
                      draft.structuredDna.levelType = levelType
                    })
                  )
                ),
                (modules) => {
                  const candidate = topCandidateByHamming(
                    [
                      "gridUnits",
                      "stairsType",
                      "internalLayoutType",
                      "windowTypeSide1",
                      "windowTypeSide2",
                      "windowTypeEnd",
                      "windowTypeTop",
                    ],
                    module,
                    modules
                  )
                  if (candidate === null) {
                    fail = true
                  }
                  return candidate as BareModule
                }
              )
            )
          )
        )
      )

      if (fail) return none

      return some(
        pipe(
          produce(rowMatrix, (draft) => {
            draft[levelIndex] = newLevel
          }),
          transposeA,
          mapA(padColumn),
          columnMatrixToDna,
          (buildingDna) =>
            ({
              label: getDescription(levelType),
              value: {
                buildingDna,
                levelType,
              },
            } as LevelTypeOpt)
        )
      )
    })
  )

  return {
    options: pipe(
      [selectedOption, ...otherOptions],
      sort(
        pipe(
          StrOrd,
          contramap((opt: LevelTypeOpt) => opt.label)
        )
      )
    ),
    selected: selectedOption.value,
    levelString: (() => {
      switch (thisLevelType?.[0]) {
        case "F":
          return "foundations"
        case "R":
          return "roof"
        default:
          return "level"
      }
    })(),
  }
}
