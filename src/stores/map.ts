import { mapA } from "@/utils"
import { dropRight, flatten, map, reduce } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { Polygon, Position } from "geojson"
import { fromLonLat, toLonLat } from "ol/proj"
import { useEffect, useMemo } from "react"
import { BufferAttribute, BufferGeometry, LineBasicMaterial } from "three"
import { proxy, useSnapshot } from "valtio"
import { subscribeKey } from "valtio/utils"
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../CONSTANTS"

const mapProxy = proxy<{
  polygon: Polygon | null
  mode: "SEARCH" | "DRAW"
}>({
  polygon: null,
  mode: "SEARCH",
})

export const setMapPolygon = (mapPolygon: Polygon) => {
  mapProxy.polygon = mapPolygon
}

export const getMapPolygonCentre = (polygon: Polygon) =>
  pipe(polygon.coordinates[0], dropRight(1), (coords) =>
    pipe(
      coords,
      reduce<Position, Position>([0, 0], ([x0, y0], [x1, y1]) => [
        x0 + x1 / coords.length,
        y0 + y1 / coords.length,
      ])
    )
  )

export const polygonToCoordinates = (polygon: Polygon) => {
  const [cx, cy] = getMapPolygonCentre(polygon)

  return pipe(
    polygon.coordinates[0],
    map(([x, y]) => [x - cx, 0.1, y - cy])
  )
}

// Multiply latitude by 2 so it corresponds to the same distance
// const bound = Math.max(
//   ...[
//     ...points.map(([x, _y]) => Math.abs(x - center[0])),
//     ...points.map(([_x, y]) => 2 * Math.abs(y - center[1])),
//   ]
// );

// return { center, bound, points };

export const useMapBoundary = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  useEffect(() => {
    const rawStoragePayload = localStorage.getItem(
      BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
    )
    if (rawStoragePayload) {
      mapProxy.polygon = JSON.parse(rawStoragePayload)
    }
  }, [])

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        color: "#454545",
      }),
    []
  )

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    if (polygon !== null && polygon.coordinates.length > 0) {
      geometry.setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array(pipe(polygon, polygonToCoordinates, flatten)),
          3
        )
      )
    }
    return geometry
  }, [polygon])

  return [geometry, material] as const
}

export const useMapMode = () => {
  const { mode } = useSnapshot(mapProxy)

  const setMode = (m: typeof mode) => {
    mapProxy.mode = m
  }

  return [mode, setMode] as const
}

export const useMapPolygon = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  useEffect(() => {
    const rawStoragePayload = localStorage.getItem(
      BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
    )
    if (rawStoragePayload) {
      mapProxy.polygon = JSON.parse(rawStoragePayload)
    }
  }, [])

  return [polygon, setMapPolygon] as const
}

export const useMapUpdater = () =>
  useEffect(() =>
    subscribeKey(mapProxy, "polygon", () => {
      if (mapProxy.polygon !== null)
        localStorage.setItem(
          BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY,
          JSON.stringify(mapProxy.polygon)
        )
    })
  )

export const toLonLatPolygon = ({ coordinates, type }: Polygon) => ({
  type,
  coordinates: pipe(coordinates, mapA(mapA((pos) => toLonLat(pos)))),
})

export const fromLonLatPolygon = ({ coordinates, type }: Polygon) => ({
  type,
  coordinates: pipe(coordinates, mapA(mapA((pos) => fromLonLat(pos)))),
})

export const metersPerPixel = (latitude: number, zoomLevel: number) => {
  var earthCircumference = 40075017
  var latitudeRadians = latitude * (Math.PI / 180)
  return (
    (earthCircumference * Math.cos(latitudeRadians)) /
    Math.pow(2, zoomLevel + 8)
  )
}

export default mapProxy
