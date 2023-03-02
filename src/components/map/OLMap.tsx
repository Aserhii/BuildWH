import { setMapPolygon, store } from "@/store"
import { Feature, Polygon } from "geojson"
import { Geolocation, Map, View } from "ol"
import OLFeature from "ol/Feature"
import GeoJson from "ol/format/GeoJSON"
import OLPolygon from "ol/geom/Polygon"
import { Draw, Modify, Snap } from "ol/interaction"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import "ol/ol.css"
import OSM from "ol/source/OSM"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import React, { useEffect, useRef } from "react"
import { subscribeKey } from "valtio/utils"
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../../CONSTANTS"

const OLMap = ({
  onPolygonCoordinates,
}: {
  onPolygonCoordinates?: (x: Polygon) => void
} = {}) => {
  const ref = useRef<HTMLDivElement>(null)
  const source = new VectorSource()
  const GeoJSON = new GeoJson()

  useEffect(() => {
    if (!ref.current) return

    const view = new View({
      center: [0, 0],
      zoom: 16,
    })

    const map = new Map({
      target: ref.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: source,
          style: new Style({
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
            stroke: new Stroke({
              color: "#ffcc33",
              width: 2,
            }),
          }),
        }),
      ],
      view,
    })

    const modify = new Modify({ source })
    map.addInteraction(modify)

    const draw = new Draw({
      source,
      type: "Polygon",
    })
    draw.on("drawstart", (event) => {
      source.clear()
    })
    draw.on("drawend", ({ feature }) => {
      const polyFeature = JSON.parse(
        GeoJSON.writeFeature(feature)
      ) as Feature<Polygon>

      onPolygonCoordinates?.(polyFeature.geometry)
    })
    map.addInteraction(draw)

    const snap = new Snap({ source })
    map.addInteraction(snap)

    var geolocation = new Geolocation({
      projection: view.getProjection(),
      tracking: true,
    })

    geolocation.on("change", function (evt) {
      const pos = geolocation.getPosition()
      if (!pos) return
      map.getView().setCenter(pos)
    })
  }, [])

  useEffect(() => {
    const rawStoragePayload = localStorage.getItem(
      BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
    )
    if (rawStoragePayload) {
      setMapPolygon(JSON.parse(rawStoragePayload))
      source.clear()
      source.addFeature(
        new OLFeature({
          geometry: new OLPolygon(store.mapPolygon.coordinates),
        })
      )
    }

    return subscribeKey(store, "mapPolygon", () => {
      localStorage.setItem(
        BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY,
        JSON.stringify(store.mapPolygon)
      )
    })
  }, [])

  return <div ref={ref} className="w-full flex-1" />
}

export default OLMap
