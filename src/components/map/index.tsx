import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "@/CONSTANTS"
import mapProxy, {
  getMapPolygonCentre,
  useMapMode,
  useMapPolygon,
} from "@/stores/map"
import { ArrowRight24, Search24, TrashCan24 } from "@carbon/icons-react"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { Snackbar } from "@mui/material"
import clsx from "clsx"
import { Feature, Polygon } from "geojson"
import mapboxgl from "mapbox-gl"
import Link from "next/link"
import { Feature as OLFeature, Map, View } from "ol"
import GeoJSON from "ol/format/GeoJSON"
import OLPolygon from "ol/geom/Polygon"
import { Draw, Modify, Snap } from "ol/interaction"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import "ol/ol.css"
import { fromLonLat } from "ol/proj"
import VectorSource from "ol/source/Vector"
import XYZ from "ol/source/XYZ"
import Fill from "ol/style/Fill"
import Stroke from "ol/style/Stroke"
import Style from "ol/style/Style"
import React, { useEffect, useRef, useState } from "react"
import { subscribeKey } from "valtio/utils"
import { IconButton } from "../ui"
import { Menu } from "../ui/icons"
import UniversalMenu from "../ui/UniversalMenu"
import { useEscape } from "../ui/utils"
import css from "./index.module.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

// const almere = fromLonLat([5.2647, 52.3508]) as [number, number]
// const westerngrund = fromLonLat([9.1515, 50.68]) as [number, number]

const gadheim = fromLonLat([9.902056, 49.843]) as [number, number]

const MapIndex = () => {
  const [universalMenu, setUniversalMenu] = useState(false)

  const geocoderDiv = useRef<HTMLDivElement>(null)
  const mapDiv = useRef<HTMLDivElement>(null)

  const maxZoom = 19

  const [mode, setMode] = useMapMode()

  const [mapPolygon] = useMapPolygon()

  const vectorSource = useRef(new VectorSource())

  const draw = useRef(
    new Draw({
      source: vectorSource.current,
      type: "Polygon",
    })
  )

  const modify = useRef(new Modify({ source: vectorSource.current }))

  const snap = useRef(new Snap({ source: vectorSource.current }))

  useEffect(() => {
    draw.current.on("drawstart", (event) => {
      mapProxy.polygon = null
      vectorSource.current.clear()
    })

    draw.current.on("drawend", ({ feature }) => {
      const polyFeature = JSON.parse(
        new GeoJSON().writeFeature(feature)
      ) as Feature<Polygon>

      mapProxy.polygon = {
        coordinates: polyFeature.geometry.coordinates,
        type: polyFeature.geometry.type,
      }
    })
  }, [])

  useEffect(() =>
    subscribeKey(mapProxy, "polygon", () => {
      if (mapProxy.polygon !== null)
        localStorage.setItem(
          BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY,
          JSON.stringify(mapProxy.polygon)
        )
    })
  )

  const [map] = useState(
    new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            maxZoom,
          }),
        }),
        new VectorLayer({
          source: vectorSource.current,
          style: new Style({
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
            stroke: new Stroke({
              color: "#fff",
              width: 2,
            }),
          }),
        }),
      ],
      view: new View({
        center: gadheim,
        zoom: 5,
        maxZoom,
      }),
      controls: [],
    })
  )

  useEffect(() => {
    if (!mapDiv.current) return
    map.setTarget(mapDiv.current)
    return () => {
      map.setTarget(undefined)
    }
  }, [map])

  useEffect(() => {
    if (!geocoderDiv.current) return

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      flyTo: true,
      marker: false,
      placeholder: "Enter the location of your site",
    })

    geocoder.addTo(geocoderDiv.current!)

    geocoder.on("result", ({ result }) => {
      const target = fromLonLat(result.center) as [number, number]
      map.getView().setCenter(target)
      map.getView().setZoom(maxZoom)

      setMode("DRAW")
    })

    return () => {
      if (!geocoderDiv.current) return
      geocoderDiv.current.replaceChildren()
    }
  }, [])

  useEffect(() => {
    if (mode === "DRAW") {
      map.addInteraction(modify.current)
      map.addInteraction(draw.current)
      map.addInteraction(snap.current)
    } else {
      map.removeInteraction(modify.current)
      map.removeInteraction(draw.current)
      map.removeInteraction(snap.current)
    }
  }, [mode])

  const [snack, setSnack] = useState(false)

  useEffect(() => {
    if (mode === "DRAW" && !mapPolygon) {
      setSnack(true)
    } else if (mapPolygon) {
      vectorSource.current.clear()
      vectorSource.current.addFeature(
        new OLFeature({
          geometry: new OLPolygon(mapPolygon.coordinates),
        })
      )
      map.getView().setCenter(getMapPolygonCentre(mapPolygon))
      map.getView().setZoom(maxZoom)
    } else {
      setSnack(false)
    }
  }, [mode])

  useEffect(() => {
    if (mapPolygon !== null && mode === "SEARCH") setMode("DRAW")
  }, [mapPolygon])

  const rootRef = useRef<HTMLDivElement>(null)

  const discardSearch = () => {
    if (mode === "SEARCH" && mapPolygon !== null) {
      setMode("DRAW")
    }
  }

  useEscape(discardSearch)

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full flex-col items-center justify-center"
      onClick={discardSearch}
    >
      <div className="absolute top-0 right-0 z-10 flex items-center justify-center text-white">
        <IconButton onClick={() => setUniversalMenu(true)}>
          <Menu />
        </IconButton>
      </div>
      <UniversalMenu
        open={universalMenu}
        close={() => setUniversalMenu(false)}
      />
      <div ref={mapDiv} className="w-full flex-1" />
      <div
        ref={geocoderDiv}
        className={clsx(css.geocoder, mode === "DRAW" && "hidden")}
      />
      {mode === "DRAW" && (
        <div className="absolute left-0 flex flex-col items-center justify-center bg-white">
          <IconButton onClick={() => void setMode("SEARCH")}>
            <div className="flex items-center justify-center">
              <Search24 />
            </div>
          </IconButton>
          <IconButton
            onClick={() => {
              mapProxy.polygon = null
              localStorage.setItem(BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY, "null")
              vectorSource.current.clear()
            }}
          >
            <div className="flex items-center justify-center">
              <TrashCan24 />
            </div>
          </IconButton>
        </div>
      )}
      <Snackbar
        autoHideDuration={6000}
        open={snack}
        onClose={() => void setSnack(false)}
        message="Draw your site boundary"
      />
      {mapPolygon !== null && (
        <div className="absolute bottom-0 right-0 w-64">
          <Link href="/site">
            <a>
              <div className="flex items-center justify-between bg-white p-2 text-black">
                <div className="text-lg">Continue</div>
                <div>
                  <ArrowRight24 />
                </div>
              </div>
            </a>
          </Link>
          <div className="bg-black p-2 text-white opacity-50">
            You will be able to change this boundary again at any time
          </div>
        </div>
      )}
    </div>
  )
}

export default MapIndex
