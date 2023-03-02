import {
  BareModule,
  ColumnModuleKey,
  filterCompatibleModules,
  Module,
  useChangeModuleLayout,
} from "@/data/module"
import { mapA, upperFirst } from "@/utils"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import { useSystemModules } from "../modules"
import { ColumnLayout } from "../layouts"

export type LayoutOpt = {
  label: string
  value: { module: Module; buildingDna: string[] }
  thumbnail?: string
}

export const useLayoutOptions = <T extends BareModule>(
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: LayoutOpt[]; selected: LayoutOpt["value"] } => {
  const module = columnLayout[columnIndex].gridGroups[levelIndex].modules[
    groupIndex
  ].module as unknown as T

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
    mapA(
      (m): LayoutOpt => ({
        label: pipe(
          m.description ?? "",
          upperFirst,
          getOrElse(() => m.dna)
        ),
        value: {
          module: m,
          buildingDna: changeModuleLayout(m),
        },
        thumbnail: m.visualReference,
      })
    )
  )

  const { value: selected } = pipe(
    options,
    findFirst((x) => x.value.module.dna === module.dna),
    getOrElse(() => options[0])
  )

  return { options, selected }
}
