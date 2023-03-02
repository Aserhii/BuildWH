import mapProxy, {
  getMapPolygonCentre,
  metersPerPixel,
  toLonLatPolygon,
} from "@/stores/map"
import { mapO, pipeLog } from "@/utils"
import * as cover from "@mapbox/tile-cover"
import { Plane } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import circleToPolygon from "circle-to-polygon"
import { interpolate } from "d3-interpolate"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { toLonLat } from "ol/proj"
import { useMemo } from "react"
import useSWR from "swr"
import { DoubleSide, ImageLoader, Texture, TextureLoader } from "three"
import { useSnapshot } from "valtio"
import geojsonArea from "@mapbox/geojson-area"
import { reduce } from "fp-ts/lib/Array"
import tilebelt from "@mapbox/tilebelt"

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
  xyz: V3
  xyz0: V3
  mpp: number
}
const TileWithDispMap = ({
  xyz: [x, y, z],
  xyz0: [x0, y0],
  satelliteBlobURL,
  dispBlobURL,
  mpp,
}: TileProps & {
  satelliteBlobURL: string
  dispBlobURL: string
}) => {
  const texture = useLoader(TextureLoader, satelliteBlobURL)
  const dispMap = useLoader(TextureLoader, dispBlobURL)

  const length = mpp * 512

  return (
    <Plane
      args={[length, length, 512, 512]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[(x - x0) * length, 0, (y - y0) * length]}
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
  xyz: [x, y, z],
  xyz0: [x0, y0, z0],
  satelliteBlobURL,
  terrainBlobURL,
  mpp,
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

    // console.log(data)

    ctx?.putImageData(imageData, 0, 0)

    const dataURL = canvas.toDataURL()
    // console.log(dataURL)
    return dataURL
  }, [terrainImage])

  return dispBlobURL === null ? null : (
    <TileWithDispMap
      {...{
        xyz: [x, y, z],
        xyz0: [x0, y0, z0],
        satelliteBlobURL,
        dispBlobURL,
        mpp,
      }}
    />
  )
}

const Tile = ({ xyz, xyz0, mpp }: TileProps) => {
  const { data: satelliteBlob } = useSWR(xyz, fetcher)
  const { data: terrainBlob } = useSWR([...xyz, true], fetcher)
  return satelliteBlob && terrainBlob ? (
    <TileWithData
      {...{
        satelliteBlobURL: satelliteBlob,
        terrainBlobURL: terrainBlob,
        xyz,
        xyz0,
        mpp,
      }}
    />
  ) : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const { tiles, latitude } = pipe(
    polygon,
    fromNullable,
    mapO((poly) =>
      pipe(poly, toLonLatPolygon, (poly) => ({
        tiles: cover.tiles(poly, {
          min_zoom: 21,
          max_zoom: 21,
        }) as V3[],
        area: geojsonArea.geometry(poly),
        latitude: poly.coordinates[0][0][1],
      }))
    ),
    getOrElse(() => ({ tiles: [] as V3[], area: 0, latitude: 0 }))
    // mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  )

  const mpp = metersPerPixel(latitude, 21 + 1)

  const getTilesLengthByDimension = (dimension: number) => {
    let min = Infinity
    let max = -1
    for (let tile of tiles) {
      const v = tile[dimension]
      min = Math.min(min, v)
      max = Math.max(max, v)
    }
    return max - min
  }

  const lengthWiseTiles = getTilesLengthByDimension(0)
  const heightWiseTiles = getTilesLengthByDimension(1)

  let ran = false

  if (!ran)
    for (let tile of tiles) {
      console.log(tilebelt.tileToGeoJSON(tile))
    }

  ran = true

  // pipe(
  //   tiles,
  //   reduce({ last: Infinity, acc: 0 }, ({ last, acc }, [x]) => ({
  //     last: x,
  //     acc: Math.max(acc, x - last),
  //   })),
  //   ({ acc }) => acc
  // ) + 1

  // const centreO = pipe(
  //   polygon,
  //   fromNullable,
  //   mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  //   // mapO((poly) => cover.tiles(poly, { min_zoom: 14, max_zoom: 17}))
  // )

  // const tiles = pipe(polygon, cover.tiles(polygon, { min_zoom: 10, max_zoom: 17})

  // const circleTiles: V3[] = pipe(
  //   centreO,
  //   mapO((centre) =>
  //     pipe(
  //       centre,
  //       (c) => circleToPolygon(c, coverageRadius, { numberOfEdges: 32 }),
  //       (geom) => cover.tiles(geom, { min_zoom: 14, max_zoom: 14 }) as V3[]
  //     )
  //   ),
  //   getOrElse(() => [] as V3[])
  // )

  return (
    <group position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
      {tiles.map((xyz) => (
        <Tile key={JSON.stringify(xyz)} xyz={xyz} xyz0={tiles[0]} mpp={mpp} />
      ))}
    </group>
  )
}

export default MapTiles
