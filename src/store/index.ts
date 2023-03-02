import { Houses } from "@/data/house"
import CameraControls from "camera-controls"
import { Polygon } from "geojson"
import { MutableRefObject } from "react"
import { Object3D } from "three"
import { proxy, ref } from "valtio"
import { initialHouses as houses } from "./houses"
import { Scope, ScopeTypeEnum } from "./scope"
import { initialMapPolygon } from "./map"

type Store = {
  houses: Houses
  scope: Scope
  camControls: CameraControls | null
  orthographic: boolean
  shadows: boolean
  lastLookAt: V6
  horizontalPointer: [number, number]
  contextMenu: [number, number] | null
  outlined: Array<MutableRefObject<Object3D | undefined>>
  mapPolygon: Polygon
}

export const store = proxy<Store>({
  houses,
  scope: {
    type: ScopeTypeEnum.enum.HOUSE,
    selected: [],
    hovered: null,
  },
  camControls: null,
  orthographic: false,
  shadows: true,
  horizontalPointer: [0, 0],
  lastLookAt: [0, 0, 0, 0, 0, 0],
  contextMenu: null,
  outlined: ref([]),
  mapPolygon: initialMapPolygon,
})

export * from "./camera"
export * from "./houses"
export * from "./map"
export * from "./scope"
