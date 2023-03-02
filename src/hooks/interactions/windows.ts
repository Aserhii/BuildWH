import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  ColumnModuleKey,
  keysFilter,
  useChangeModuleLayout,
} from "@/data/module"
import { WindowType } from "@/data/windowType"
import siteContext from "@/stores/context"
import { filterA, filterMapA, mapA, StrEq } from "@/utils"
import { findFirstMap, getEq } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, Option, some } from "fp-ts/lib/Option"
import { ColumnLayout, columnLayoutToDNA } from "../layouts"
import { useSystemModules } from "../modules"
import { useSide } from "../side"

export type WindowOpt = {
  label: string
  value: { windowType: string; buildingDna: string[] }
  thumbnail?: string
}

export const useWindowOptions = <T extends BareModule>(
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: WindowOpt[]; selected: WindowOpt["value"] } => {
  const module = columnLayout[columnIndex].gridGroups[levelIndex].modules[
    groupIndex
  ].module as unknown as T

  const side = useSide(siteContext.buildingId!)()

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
        filterA((x) => x.systemId === module.systemId),
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
    mapA(([m, wt]): WindowOpt => {
      return {
        label: wt.description,
        value: { buildingDna: changeModule(m), windowType: wt.code },
        thumbnail: wt.imageUrl,
      }
    })
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
