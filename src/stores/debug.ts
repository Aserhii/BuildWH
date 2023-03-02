import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { filterMap, findFirst } from "fp-ts/lib/ReadonlyArray"
import { useSnapshot } from "valtio"
import { derive } from "valtio/utils"
import systemsData from "./systems"

const debug = derive({
  houseTypeModules: async (get) => {
    const houseTypes = await get(systemsData).houseTypes
    const systemModules = await get(systemsData).modules

    return pipe(
      houseTypes,
      mapRA((houseType) =>
        pipe(
          houseType.dna,
          filterMap((strand) =>
            pipe(
              systemModules,
              findFirst((module) => module.dna === strand)
            )
          ),
          (modules) => ({ houseType, modules })
        )
      )
    )
  },
})

export const useDebug = () => {
  const { houseTypeModules } = useSnapshot(debug)
  return houseTypeModules
}

export default debug
