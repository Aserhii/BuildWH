import mapProxy, {
  getMapPolygonCentre,
  metersPerPixel,
  toLonLatPolygon,
} from "@/stores/map"
import { mapO, pipeLog } from "@/utils"
import geojsonArea from "@mapbox/geojson-area"
import * as cover from "@mapbox/tile-cover"
import tilebelt from "@mapbox/tilebelt"
import { Plane } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { center, feature, getCoord, midpoint, toMercator } from "@turf/turf"
import { interpolate } from "d3-interpolate"
import { zipWith } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { useMemo } from "react"
import useSWR from "swr"
import { DoubleSide, ImageLoader, TextureLoader } from "three"
import { useSnapshot } from "valtio"

const coverageRadius = 100

const fetcher = (x: number, y: number, z: number, terrain: boolean = false) =>
  fetch(
    `https://api.mapbox.com/v4/mapbox.${
      terrain ? "terrain-rgb" : "satellite"
    }/${z}/${x}/${y}@2x.pngraw?sku=1234abcd&access_token=${
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    }`
  )
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob))

type TileProps = {
  tile: V3
  mpp: number
  polygonCentre: [number, number]
}
const TileWithDispMap = ({
  tile,
  satelliteBlobURL,
  dispBlobURL,
  mpp,
  polygonCentre,
}: TileProps & {
  satelliteBlobURL: string
  dispBlobURL: string
}) => {
  const texture = useLoader(TextureLoader, satelliteBlobURL)
  const dispMap = useLoader(TextureLoader, dispBlobURL)

  const length = mpp * 512

  const tileBox = pipe(tile, tilebelt.tileToBBOX)

  const tileCenter = pipe(
    midpoint([tileBox[0], tileBox[1]], [tileBox[2], tileBox[3]]),
    toMercator
  ).geometry.coordinates

  const [x, y] = zipWith(tileCenter, polygonCentre, (a, b) => (b - a) / 1.7)

  const position: V3 = [x, 0, y]

  // const position: V3 = [bx - px, 0.05, by - py]

  return (
    <Plane
      args={[length, length, 512, 512]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
    >
      <meshStandardMaterial
        map={texture}
        side={DoubleSide}
        displacementMap={dispMap}
      />
    </Plane>
  )
}

const TileWithData = ({
  tile: [x, y, z],
  satelliteBlobURL,
  terrainBlobURL,
  mpp,
  polygonCentre: centre,
}: TileProps & { satelliteBlobURL: string; terrainBlobURL: string }) => {
  const terrainImage = useLoader(ImageLoader, terrainBlobURL)
  // const terrainTexture = useLoader(TextureLoader, terrainBlobURL)

  const high = 500

  const interpolator = interpolate(0, 256)

  const interp = (x: number) => interpolator(x / high)

  const dispBlobURL = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    ctx?.drawImage(terrainImage, 0, 0)

    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)

    if (!imageData) {
      return null
    }

    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const metres =
        -10000 + (data[i] * 256 * 256 + data[i + 1] * 256 + data[i + 2]) * 0.1

      const displacement = interp(metres)
      data[i] = displacement
      data[i + 1] = displacement
      data[i + 2] = displacement
    }

    ctx?.putImageData(imageData, 0, 0)

    const dataURL = canvas.toDataURL()

    return dataURL
  }, [terrainImage])

  return dispBlobURL === null ? null : (
    <TileWithDispMap
      {...{
        tile: [x, y, z],
        satelliteBlobURL,
        dispBlobURL,
        mpp,
        polygonCentre: centre,
      }}
    />
  )
}

const Tile = ({ tile, mpp, polygonCentre: centre }: TileProps) => {
  const { data: satelliteBlob } = useSWR(tile, fetcher)
  const { data: terrainBlob } = useSWR([...tile, true], fetcher)
  return satelliteBlob && terrainBlob ? (
    <TileWithData
      {...{
        satelliteBlobURL: satelliteBlob,
        terrainBlobURL: terrainBlob,
        tile: tile,
        mpp,
        polygonCentre: centre,
      }}
    />
  ) : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const { tiles, latitude, centre } = pipe(
    polygon,
    fromNullable,
    mapO((mercatorPoly) =>
      pipe(
        mercatorPoly,
        toLonLatPolygon,
        (lonLatPoly) => ({
          tiles: cover.tiles(lonLatPoly, {
            min_zoom: 21,
            max_zoom: 21,
          }) as V3[],
          area: geojsonArea.geometry(lonLatPoly),
          latitude: lonLatPoly.coordinates[0][0][1],
          centre: pipe(mercatorPoly, getMapPolygonCentre) as [number, number],
        }),
        pipeLog
      )
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
      {tiles.map((tile) => (
        <Tile
          key={JSON.stringify(tile)}
          {...{ tile, mpp, polygonCentre: centre }}
        />
      ))}
    </group>
  )
}

export default MapTiles
