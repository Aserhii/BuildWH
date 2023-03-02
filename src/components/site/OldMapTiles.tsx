import mapProxy, { getMapPolygonCentre } from "@/stores/map"
import { mapO } from "@/utils"
import * as cover from "@mapbox/tile-cover"
import { Plane } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import circleToPolygon from "circle-to-polygon"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { toLonLat } from "ol/proj"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import {
  CanvasTexture,
  DataTextureLoader,
  DoubleSide,
  ImageLoader,
  Texture,
  TextureLoader,
} from "three"
import { useSnapshot } from "valtio"
import { interpolate } from "d3-interpolate"

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
}
const TileWithDispMap = ({
  xyz: [x, y, z],
  xyz0: [x0, y0],
  satelliteBlobURL,
  dispBlobURL,
  terrainTexture,
}: TileProps & {
  satelliteBlobURL: string
  dispBlobURL: string
  terrainTexture: Texture
}) => {
  const texture = useLoader(TextureLoader, satelliteBlobURL)
  const dispMap = useLoader(TextureLoader, dispBlobURL)

  return (
    <Plane
      args={[10, 10, 512, 512]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[(x - x0) * 10, 0, (y - y0) * 10]}
      receiveShadow
    >
      <meshStandardMaterial
        map={terrainTexture}
        // side={DoubleSide}
        // displacementMap={dispMap}
        displacementScale={1000}
      />
    </Plane>
  )
}

const TileWithData = ({
  xyz: [x, y, z],
  xyz0: [x0, y0, z0],
  satelliteBlobURL,
  terrainBlobURL,
}: TileProps & { satelliteBlobURL: string; terrainBlobURL: string }) => {
  const terrainImage = useLoader(ImageLoader, terrainBlobURL)
  const terrainTexture = useLoader(TextureLoader, terrainBlobURL)

  // const high = 16843008

  // const interpolator = interpolate(0, 256)

  // const interp = (x: number) => interpolator(x / high)

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
      const ele =
        -10000 + (data[i] * 256 * 256 + data[i + 1] * 256 + data[i + 2]) * 0.1

      data[i] = ele
      data[i + 1] = ele
      data[i + 2] = ele
    }

    ctx?.putImageData(imageData, 0, 0)

    return canvas.toDataURL()
  }, [terrainImage])

  return dispBlobURL === null ? null : (
    <TileWithDispMap
      {...{
        xyz: [x, y, z],
        xyz0: [x0, y0, z0],
        satelliteBlobURL,
        dispBlobURL,
        terrainTexture,
      }}
    />
  )
}

const Tile = ({ xyz, xyz0 }: TileProps) => {
  const { data: satelliteBlob } = useSWR(xyz, fetcher)
  const { data: terrainBlob } = useSWR([...xyz, true], fetcher)
  return satelliteBlob && terrainBlob ? (
    <TileWithData
      {...{
        satelliteBlobURL: satelliteBlob,
        terrainBlobURL: terrainBlob,
        xyz,
        xyz0,
      }}
    />
  ) : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const centreO = pipe(
    polygon,
    fromNullable,
    mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  )

  const tiles: V3[] = pipe(
    centreO,
    mapO((centre) =>
      pipe(
        centre,
        (c) => circleToPolygon(c, coverageRadius, { numberOfEdges: 32 }),
        (geom) => cover.tiles(geom, { min_zoom: 14, max_zoom: 14 }) as V3[]
      )
    ),
    getOrElse(() => [] as V3[])
  )

  return (
    <group position={[0, 0.05, 0]}>
      {tiles.map((xyz) => (
        <Tile key={JSON.stringify(xyz)} xyz={xyz} xyz0={tiles[0]} />
      ))}
    </group>
  )
}

export default MapTiles
