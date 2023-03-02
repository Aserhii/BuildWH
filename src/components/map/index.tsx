import Layout from "@/components/layouts"
import { degreeToMeters, maxMeters } from "@/data/mapPolygon"
import { setMapPolygon } from "@/store/map"
import React, { Fragment, ReactElement, Suspense } from "react"
import OLMap from "./OLMap"

const maxAllowedBound = maxMeters / degreeToMeters

const MapPageIndex = () => {
  // const [position, setPosition] = useState<{
  //   longitude: number
  //   latitude: number
  // }>({
  //   longitude: 50,
  //   latitude: 50,
  // })

  // const [warningModal, setWarningModal] = useState(false)

  // probably ref the map

  // const centerFirst = () => {
  //   const map = mapRef.current
  //   const firstMapPolygon = mapPolygons?.[0]
  //   if (!map || !firstMapPolygon) {
  //     return
  //   }
  //   const { center } = mapPolygonInfo(firstMapPolygon)
  //   map.setCenter(center)
  //   map.setZoom(15)
  // }

  // useEffect(() => {
  //   const map = new mapboxgl.Map({
  //     container: "map-container", // container id
  //     style: "mapbox://styles/mapbox/satellite-v9", // style URL
  //     center: [-0.2416811, 51.5285582], // starting position [lng, lat]
  //     zoom: 15, // starting zoom
  //   })

  //   // Source: https://docs.mapbox.com/mapbox-gl-js/example/hillshade/
  //   map.on("load", function () {
  //     map.addSource("dem", {
  //       type: "raster-dem",
  //       url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  //     })
  //     map.addLayer(
  //       {
  //         id: "hillshading",
  //         source: "dem",
  //         type: "hillshade",
  //         // insert below waterway-river-canal-shadow;
  //         // where hillshading sits in the Mapbox Outdoors style
  //       }
  //       // "waterway-river-canal-shadow"
  //     )
  //   })

  //   const draw = new MapboxDraw()
  //   const getPolygons = (): MapPolygons => {
  //     return draw.getAll().features as MapPolygons
  //   }
  //   map.addControl(draw)
  //   if (mapPolygons) {
  //     draw.add({
  //       type: "FeatureCollection",
  //       features: mapPolygons,
  //     })
  //   }
  //   map.addControl(
  //     new MapboxGeocoder({
  //       accessToken: mapboxgl.accessToken,
  //       mapboxgl: mapboxgl as any,
  //     })
  //   )
  //   map.on("draw.create", () => {
  //     setMapPolygons(getPolygons())
  //   })
  //   map.on("draw.update", () => {
  //     setMapPolygons(getPolygons())
  //   })
  //   map.on("draw.delete", () => {
  //     setMapPolygons(getPolygons())
  //   })
  //   mapRef.current = map
  //   drawRef.current = draw
  //   centerFirst()
  //   return () => {
  //     map.remove()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // const maxBound: number = useMemo(() => {
  //   const bounds = mapPolygons
  //     ? mapPolygons.map((polygon) => {
  //         return mapPolygonInfo(polygon).bound
  //       })
  //     : []
  //   return reduce<number, number>(max, 0, bounds)
  // }, [mapPolygons])

  // const fixPolygons = () => {
  //   const newPolygons = (mapPolygons || []).map((polygon) => {
  //     return scaleMapPolygon((maxAllowedBound / maxBound) * 0.98, polygon)
  //   })
  //   setMapPolygons(newPolygons)
  //   const draw = drawRef.current
  //   if (draw) {
  //     draw.deleteAll()
  //     draw.add({
  //       type: "FeatureCollection",
  //       features: newPolygons,
  //     })
  //   }
  //   setWarningModal(false)
  // }

  return (
    <Fragment>
      {/* {warningModal && (
        <Modal
          title="Map bounds are too large"
          onClose={() => {
            setWarningModal(false)
          }}
        >
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => {
                setWarningModal(false)
              }}
            >
              Cancel
            </button>
            <button
              className="bg-gray-800 px-4 py-1 text-white hover:bg-black"
              // onClick={fixPolygons}
            >
              Fix
            </button>
          </div>
        </Modal>
      )} */}
      {/* <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 transform flex-col justify-center bg-white shadow">
        {maxBound > maxAllowedBound ? (
          <IconButton
            onClick={() => {
              setWarningModal(true)
            }}
          >
            <AlertTriangle />
          </IconButton>
        ) : null}
        <IconButton onClick={centerFirst}>
          <Crosshair />
        </IconButton>
      </div> */}
      {/* <input
        id="track"
        type="checkbox"
        className="absolute top-0 right-0 z-50"
        onChange={(e) => setTracking(Boolean(e.target.value))}
      /> */}
      <Suspense fallback={null}>
        <OLMap onPolygonCoordinates={setMapPolygon} />
      </Suspense>
    </Fragment>
  )
}

MapPageIndex.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default MapPageIndex
