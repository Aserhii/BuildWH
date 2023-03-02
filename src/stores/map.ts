import { dropRight } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { flatten, map, reduce } from "fp-ts/lib/ReadonlyArray"
import { Polygon, Position } from "geojson"
import { useMemo } from "react"
import { BufferAttribute, BufferGeometry, LineBasicMaterial } from "three"
import { proxy, useSnapshot } from "valtio"
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../CONSTANTS"
import { SSR } from "../utils"

const emptyMapPolygon: Polygon = {
  coordinates: [],
  type: "Polygon",
}

const mapPolygon = proxy(emptyMapPolygon)

export const initialMapPolygon = ((): Polygon => {
  if (SSR) return emptyMapPolygon
  const rawStoragePayload = localStorage.getItem(
    BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
  )
  if (!rawStoragePayload) {
    return emptyMapPolygon
  }
  return JSON.parse(rawStoragePayload)
})()

export const setMapPolygon = (mapPolygon: Polygon) => {
  mapPolygon = mapPolygon
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
  const { coordinates, type } = useSnapshot(mapPolygon)

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        // color: "#454545",
        color: "#ff0000",
      }),
    []
  )

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    if (coordinates.length > 0) {
      geometry.setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array(pipe(mapPolygon, polygonToCoordinates, flatten)),
          3
        )
      )
    }
    return geometry
  }, [coordinates, type])

  return [geometry, material] as const
}
