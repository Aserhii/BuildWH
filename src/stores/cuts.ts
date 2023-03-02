import { pipe } from "fp-ts/lib/function"
import { derive } from "valtio/utils"
import context from "./context"
import houses from "./houses"

type Result = {}

const cuts = derive({
  clippingPlanes: (get) => {
    const hs = get(houses)
    const { buildingId, levelIndex } = get(context)
    if (buildingId) {
      if (levelIndex) {
        return pipe(undefined)
      }
      return pipe(undefined)
    }
    return pipe(undefined)
  },
})

export default cuts
