import { ColumnLayout, useColumnLayout } from "@/hooks/layouts"
import { proxyMap } from "valtio/utils"

type BuildingID = string

const columnLayouts = proxyMap<BuildingID, ColumnLayout>()
// const rowLayouts = proxyMap<BuildingID, RowLayout>()

// export const useCachedColumnLayout = (buildingId: BuildingID) => {
//   const cachedColumnLayout = columnLayouts.get(buildingId)
//   if (cachedColumnLayout) return cachedColumnLayout

//   const columnLayout = useColumnLayout(buildingId)
//   columnLayouts.set(buildingId, columnLayout)
//   return columnLayout
// }
