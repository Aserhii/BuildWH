import { useBuildSystemsData } from "@/contexts/BuildSystemsData"
import { LoadedModule, Module } from "@/data/module"
import {
  filterRA,
  mapO,
  mapRA,
  mapWithIndexRA,
  reduceWithIndexRA,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import { Ord as StrOrd } from "fp-ts/lib/string"
import { useMemo, useState } from "react"
import {
  PositionedColumn,
  PositionedModule,
  PositionedRow,
  useColumnLayout,
} from "./layouts"

const useGetVanillaModule = () => {
  const { modules: allModules } = useBuildSystemsData()
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

// I think you can definitely use instancing for this
export const useStretchedColumns = (
  buildingId: string,
  back: boolean = false
) => {
  const [n, setN] = useState(0)
  const getVanillaModule = useGetVanillaModule()

  const columnLayout = useColumnLayout(buildingId)

  const endColumn = columnLayout[back ? columnLayout.length - 1 : 0]

  const vanillaGridGroups: readonly PositionedRow[] = pipe(
    endColumn.gridGroups,
    mapRA(({ levelIndex, levelType, y, modules }: PositionedRow) => ({
      levelIndex,
      levelType,
      y,
      modules: pipe(
        modules,
        reduceWithIndexRA(
          [],
          (
            i,
            positionedModules: PositionedModule[],
            { module: moduleIn }: PositionedModule
          ) => {
            const isFirst: boolean = i === 0

            const vanillaModuleOut = getVanillaModule(moduleIn)

            if (!vanillaModuleOut) throw new Error("No vanilla module")

            const z = isFirst
              ? vanillaModuleOut.length / 2
              : positionedModules[i - 1].z +
                positionedModules[i - 1].module.length / 2 +
                vanillaModuleOut.length / 2

            return [
              ...positionedModules,
              {
                module: vanillaModuleOut,
                z,
              },
            ]
          }
        )
      ),
    }))
  )

  const vanillaWidth = vanillaGridGroups[0].modules.reduce(
    (acc, v) => acc + v.module.length,
    0
  )

  // see next comment
  const z0 = endColumn.z

  const extraCols = useMemo(
    () =>
      pipe(
        [...Array(n)],
        mapWithIndexRA(
          (columnIndex): PositionedColumn => ({
            gridGroups: vanillaGridGroups,
            columnIndex,
            // should work with z0
            // logic on front vs. back
            z: vanillaWidth * columnIndex,
          })
        )
      ),
    [n]
  )

  const newDeltaZ = (dz: number, last: boolean = false) => {
    const next = Math.max(Math.floor(dz / vanillaWidth), 0)
    if (next !== n) setN(next)
    if (last && n !== 0) {
      setN(0)
    }
  }

  return [newDeltaZ, extraCols] as const
}
