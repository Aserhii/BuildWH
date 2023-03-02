import { Feature, Polygon } from "geojson"
import { safeLocalStorageGet } from "../utils"
import { map, slice } from "ramda"

export type MapPolygons = Array<Feature<Polygon>>

const localStorageKey: string = "buildx-v1-polygon-features"

export const getMapPolygons = (): MapPolygons | null => {
  return safeLocalStorageGet(localStorageKey)
}

export const saveMapPolygons = (features: MapPolygons | null) => {
  localStorage.setItem(localStorageKey, JSON.stringify(features))
}

export const mapPolygonInfo = (
  polygon: Feature<Polygon>
): {
  points: Array<[number, number]>
  center: [number, number]
  bound: number
} => {
  const points: Array<[number, number]> = map(
    (pos) => [pos[0], pos[1]],
    polygon.geometry.coordinates[0]
  )

  const center = slice(0, -1, points).reduce(
    ([accX, accY], [currentX, currentY], _index, arr) => {
      return [accX + currentX / arr.length, accY + currentY / arr.length]
    },
    [0, 0]
  )

  // Multiply latitude by 2 so it corresponds to the same distance
  const bound = Math.max(
    ...[
      ...points.map(([x, _y]) => Math.abs(x - center[0])),
      ...points.map(([_x, y]) => 2 * Math.abs(y - center[1])),
    ]
  )

  return { center, bound, points }
}

export const scaleMapPolygon = (
  factor: number,
  polygon: Feature<Polygon>
): Feature<Polygon> => {
  const info = mapPolygonInfo(polygon)
  const [centerX, centerY] = info.center
  return {
    ...polygon,
    geometry: {
      ...polygon.geometry,
      coordinates: polygon.geometry.coordinates.map((points) =>
        points.map(([x, y]) => [
          centerX + (x - centerX) * factor,
          centerY + (y - centerY) * factor,
        ])
      ),
    },
  }
}

export const degreeToMeters = (6378.137 * 1000) / (180 / Math.PI)

export const maxMeters = 50

export const mapPolygonsToCoordinates = (
  polygons: MapPolygons
): Array<[number, number]> => {
  const { points, center } = mapPolygonInfo(polygons[0])

  return points.map(([x, y]) => [
    (x - center[0]) * degreeToMeters,
    (y - center[1]) * degreeToMeters * 2,
  ])
}
