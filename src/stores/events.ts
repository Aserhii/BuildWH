import { proxy } from "valtio"

type Events = {
  exportBuildingGLB: string | null
  dragModule: {
    z: number
    z0: number
    length: number
  } | null
}

const events = proxy<Events>({
  exportBuildingGLB: null,
  dragModule: null,
})

export const exportGLB = (buildingId: string) => {
  events.exportBuildingGLB = buildingId
}

export const glbExported = () => {
  events.exportBuildingGLB = null
}

export default events
