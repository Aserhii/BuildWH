import { Module } from "@/data/module"
import { filterRA, mapO, mapRA, mapRR } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { getOrElse, none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  head,
  reduceWithIndex,
  sort,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useSnapshot } from "valtio"
import { derive } from "valtio/utils"
import { default as baseHouses } from "./houses"
import systemsData from "./systems"
import { Ord as StrOrd } from "fp-ts/lib/string"

export type BuildingRow = {
  row: Array<{
    module: Module
    z: number
  }>
  vanillaModules: {
    END: Module
    MID: Module
  }
  y: number
}

const housesRows = derive({
  housesRows: async (get) => {
    const sysData = await get(systemsData)
    const allModules = await sysData.modules
    const houseTypes = await sysData.houseTypes
    const houses = get(baseHouses)

    return pipe(
      houses,
      mapRR((house) => {
        const modules = pipe(
          houseTypes,
          findFirst((ht) => ht.id === house.houseTypeId),
          mapO((houseType) => house.dna ?? houseType.dna),
          mapO(
            flow(
              filterMap((dna) =>
                pipe(
                  allModules,
                  findFirst(
                    (sysM: Module) =>
                      sysM.systemId === house.systemId && sysM.dna === dna
                  )
                )
              )
            )
          ),
          getOrElse((): readonly Module[] => [])
        )

        const jumpIndices = pipe(
          modules,
          filterMapWithIndex((i, m) =>
            m.structuredDna.positionType === "END" ? some(i) : none
          ),
          filterWithIndex((i) => i % 2 === 0)
        )

        return pipe(
          modules,
          reduceWithIndex([], (i, modules: Module[][], module: Module) => {
            return jumpIndices.includes(i)
              ? [...modules, [module]]
              : produce((draft) => void draft[draft.length - 1].push(module))(
                  modules
                )
          }),
          mapRA((row) =>
            pipe(
              row,
              reduceWithIndex(
                [],
                (
                  i,
                  prevs: {
                    module: Module
                    z: number
                  }[],
                  module
                ) => {
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
                row: { module: Module; z: number }[]
                y: number
                vanillaModules: {
                  MID: Module | null
                  END: Module | null
                }
              }[],
              row
            ) => {
              const isFirst = i === 0
              return [
                ...b,
                {
                  row,
                  y: isFirst
                    ? -row[0].module.height
                    : i === 1
                    ? 0
                    : b[i - 1].y + row[0].module.height,
                  vanillaModules: {
                    END: pipe(
                      allModules,
                      filterRA(
                        (module) =>
                          module.systemId === house.systemId &&
                          module.structuredDna.levelType ===
                            row[0].module.structuredDna.levelType
                      ),
                      sort(
                        pipe(
                          StrOrd,
                          contramap((x: Module) => x.dna)
                        )
                      ),
                      head,
                      toNullable
                    ),
                    MID: pipe(
                      allModules,
                      filterRA(
                        (module) =>
                          module.systemId === house.systemId &&
                          module.structuredDna.levelType ===
                            row[0].module.structuredDna.levelType
                      ),
                      sort(
                        pipe(
                          StrOrd,
                          contramap((x: Module) => x.dna)
                        )
                      ),
                      head,
                      toNullable
                    ),
                  },
                },
              ]
            }
          )
        )
      })
    )
  },
})

export const useHouseRows = (houseId: string) => {
  const snap = useSnapshot(housesRows)
  return snap.housesRows[houseId]
}
