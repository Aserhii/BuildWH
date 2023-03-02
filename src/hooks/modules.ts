import { useSystemData, useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  keysFilter,
  Module,
  topCandidateByHamming,
} from "@/data/module"
import { StairType } from "@/data/stairType"
import {
  all,
  errorThrower,
  filterA,
  filterRA,
  mapA,
  mapO,
  reduceA,
  StrOrd,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { replicate } from "fp-ts/lib/Array"
import { identity, pipe } from "fp-ts/lib/function"
import { match } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"

export const getLevelNumber = (levelLetter: string) =>
  ["F", "G", "M", "T", "R"].findIndex((x) => x === levelLetter)

export const useGetVanillaModule = <T extends BareModule>(
  opts: { loadGLTF?: boolean } = {}
) => {
  const { loadGLTF = false } = opts
  const { modules: systemModules } = useSystemData()

  return (
    module: T,
    opts: {
      sectionType?: string
      positionType?: string
      levelType?: string
      constrainGridType?: boolean
    } = {}
  ) => {
    const {
      sectionType,
      positionType,
      levelType,
      constrainGridType = true,
    } = opts

    return pipe(
      systemModules,
      filterRA((sysModule) =>
        all(
          sectionType
            ? sysModule.structuredDna.sectionType === sectionType
            : sysModule.structuredDna.sectionType ===
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
      mapO((m) => (loadGLTF ? loadModule(m) : m))
    )
  }
}

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
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
          ...replicate(
            target - levelLength,
            pipe(
              getVanillaModule(level[0]),
              match(
                errorThrower(`no vanilla module found for ${level[0].dna}`),
                identity
              )
            )
          ),
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
          (!levelType
            ? x.structuredDna.levelType === oldModule.structuredDna.levelType
            : x.structuredDna.levelType === levelType)
      ),
      topCandidateByHamming(oldModule, [
        "internalLayoutType",
        "windowTypeSide1",
        "windowTypeSide2",
        "windowTypeEnd",
        "windowTypeTop",
      ])
    )
  }
}
