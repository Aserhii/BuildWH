import { Module } from "@/data/module"
import { mapO, mapRA, mapRR } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  reduceWithIndex,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useSnapshot } from "valtio"
import { derive } from "valtio/utils"
import { default as baseHouses } from "./houses"
import systemsData from "./systems"

const housesRows = derive({
  housesRows: async (get) => {
    const sysData = await get(systemsData)
    const sysModules = await sysData.modules
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
                  sysModules,
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
