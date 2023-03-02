import { proxy } from "valtio"

type Events = {
  exportBuildingGLB: string | null
}

const events = proxy<Events>({
  exportBuildingGLB: null,
})

export const exportGLB = (buildingId: string) => {
  events.exportBuildingGLB = buildingId
}

export const glbExported = () => {
  events.exportBuildingGLB = null
}

export default events
