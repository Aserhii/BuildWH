import MVTLoader from "@/loaders/mvt"
import mapProxy, {
  getMapPolygonCentre,
  metersPerPixel,
  toLonLatPolygon,
} from "@/stores/map"
import { flattenA, mapA, mapO, pipeLog, pipeLogWith } from "@/utils"
import geojsonArea from "@mapbox/geojson-area"
import * as cover from "@mapbox/tile-cover"
import { Extrude } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { toMercator } from "@turf/turf"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { Feature, Polygon, Position } from "geojson"
import produce from "immer"
import { fromLonLat, toLonLat } from "ol/proj"
import { useEffect, useMemo } from "react"
import { Shape } from "three"
import { useSnapshot } from "valtio"
import * as tilebelt from "@mapbox/tilebelt"

const midPipe = (feature: Feature<Polygon>) =>
  JSON.stringify(feature.geometry.coordinates, null, 2)

const log = pipeLogWith(midPipe)

const tileToURL = ([x, y, z]: [number, number, number]) => {
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/${z}/${x}/${y}.mvt?style=mapbox://styles/mapbox/light-v10@00&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
  return url
}
// .then((blob) => URL.createObjectURL(blob))

// const foo = "https://api.mapbox.com/v4/{tileset_id}/{zoom}/{x}/{y}.{format}"

type TileProps = {
  tile: V3
  mpp: number
  polygonCentre: [number, number]
}

const extrudeSettings = { steps: 2, depth: 1, bevelEnabled: false }

const Tile = ({ tile, mpp, polygonCentre }: TileProps) => {
  const features: Feature[] = useLoader(
    MVTLoader as any,
    tileToURL(tile)
  ) as any

  console.log(JSON.stringify(features, null, 2))

  return null

  const shape = useMemo(() => {
    const _shape = new Shape()

    const polygonFeatures = features.filter(
      (f) => f.geometry.type === "Polygon"
    ) as Feature<Polygon>[]

    const realCoords = pipe(
      polygonFeatures,
      mapA((feature) =>
        pipe(
          feature,
          toMercator,
          produce((draft: Feature<Polygon>) => {
            draft.geometry.coordinates[0].forEach((coords) => {
              coords[0] -= polygonCentre[0]
              coords[1] -= polygonCentre[1]
            })
          }),
          ({ geometry: { coordinates } }): V2[] => coordinates[0] as V2[]
        )
      ),
      flattenA
    )

    // console.log({
    //   bbox: tilebelt.tileToBBOX(tile),
    //   geojson: tilebelt.tileToGeoJSON(tile),
    // })

    _shape.moveTo(...realCoords[0])
    for (const [x, y] of realCoords.slice(1)) {
      _shape.lineTo(x, y)
    }

    return _shape
  }, [features])

  return (
    <>
      <Extrude args={[shape, extrudeSettings]} rotation={[Math.PI / 2, 0, 0]}>
        <meshToonMaterial color="#3E64FF" />
      </Extrude>
    </>
  )

  // return data ? (
  //   <TileWithData
  //     {...{
  //       satelliteBlobURL: satelliteBlob,
  //       terrainBlobURL: terrainBlob,
  //       tile: tile,
  //       mpp,
  //       polygonCentre: centre,
  //     }}
  //   />
  // ) : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const { tiles, latitude, centre } = pipe(
    polygon,
    fromNullable,
    mapO((mercatorPoly) =>
      pipe(mercatorPoly, toLonLatPolygon, (lonLatPoly) => ({
        tiles: cover.tiles(lonLatPoly, {
          min_zoom: 21,
          max_zoom: 21,
        }) as V3[],
        area: geojsonArea.geometry(lonLatPoly),
        latitude: lonLatPoly.coordinates[0][0][1],
        centre: pipe(mercatorPoly, getMapPolygonCentre) as [number, number],
      }))
    ),
    getOrElse(() => ({
      tiles: [] as V3[],
      area: 0,
      latitude: 0,
      centre: [0, 0] as [number, number],
    }))
    // mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  )

  const mpp = metersPerPixel(latitude, 21 + 1)

  return (
    <group position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
      {tiles
        .map((tile) => (
          <Tile
            key={JSON.stringify(tile)}
            {...{ tile, mpp, polygonCentre: centre }}
          />
        ))
        .slice(2, 3)}
    </group>
  )
}

export default MapTiles
