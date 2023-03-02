import { pipe } from "fp-ts/lib/function"
import { derive } from "valtio/utils"
import siteContext from "./context"
import houses from "./houses"

type Result = {}

const cuts = derive({
  clippingPlanes: (get) => {
    const hs = get(houses)
    const { buildingId, levelIndex } = get(siteContext)
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
