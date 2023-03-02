import { DEFAULT_ORIGIN } from "@/CONSTANTS"
import { SystemsDataContext } from "@/contexts/SystemsData"
import { clearIlluminatedMaterials } from "@/stores/highlights"
import { useMapBoundary } from "@/stores/map"
import { useMap, useR3FRoot } from "@/stores/mapSync"
import menu from "@/stores/menu"
import { setXZ } from "@/stores/pointer"
import scope from "@/stores/scope"
import { useSettings } from "@/stores/settings"
import { reverseV2 } from "@/utils"
import { useContextBridge } from "@react-three/drei"
import {
  addAfterEffect,
  addEffect,
  advance,
  createRoot,
  events,
  extend,
} from "@react-three/fiber"
import mapboxgl, { AnyLayer } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Fragment, PropsWithChildren, useEffect, useState } from "react"
import { sRGBEncoding } from "three"
import Effects from "../site/Effects"
import GroundCircle from "../site/GroundCircle"
import ShadowPlane from "../site/ShadowPlane"
import { HorizontalPlane } from "../ui-3d/HorizontalPlane"
import Lighting from "../ui-3d/Lighting"
import RectangularGrid from "../ui-3d/RectangularGrid"
import * as THREE from "three"
import MapboxThreeAppThreeTree from "./MapboxThreeAppThreeTree"

extend(THREE)

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

type Props = PropsWithChildren<{}>

const MapNgThreeInit = (props: Props) => {
  const { children } = props
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null)

  const [root, setRoot] = useR3FRoot()

  const [map, setMap] = useMap()

  const { shadows } = useSettings()
  const ContextBridge = useContextBridge(SystemsDataContext)
  const [boundary, boundaryMaterial] = useMapBoundary()

  useEffect(() => {
    if (!mapElement) return

    if (!map) {
      setMap(
        new mapboxgl.Map({
          container: mapElement, // container ID
          style: "mapbox://styles/mapbox/streets-v11", // style URL
          center: reverseV2(DEFAULT_ORIGIN), // starting position [lng, lat]
          zoom: 18, // starting zoom
          antialias: true,
          // interactive: false,
        })
      )
    }

    if (!map) return

    // const size = { width: window.innerWidth, height: window.innerHeight }
    const canvas = mapElement.querySelector("canvas")

    if (!canvas) return

    if (!root) setRoot(createRoot(canvas))
    if (!root) return

    const customLayer: AnyLayer = {
      id: "custom_layer",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, context) {
        root.configure({
          events,
          frameloop: "never",
          gl: {
            alpha: true,
            antialias: true,
            autoClear: false,
            canvas: map.getCanvas(),
            context,
            outputEncoding: sRGBEncoding,
            preserveDrawingBuffer: true,
            localClippingEnabled: true,
          },
          size: {
            width: map.getCanvas().clientWidth,
            height: map.getCanvas().clientHeight,
            top: 0,
            left: 0,
          },
          onCreated: (state) => {
            state.events.connect?.(mapElement)
            addEffect(() => state.gl.resetState())
            addAfterEffect(() => map.triggerRepaint())
          },
        })

        map.repaint = false

        root.render(
          <Fragment>
            {/* <MapboxThreeAppThreeTree /> */}
            <axesHelper />
            <Lighting />
            {/* <group position={[0.5, 0, 0.5]}> */}
            {/* <RectangularGrid
              x={{ cells: 61, size: 1 }}
              z={{ cells: 61, size: 1 }}
              color="#ababab"
            /> */}
            {/* </group> */}
            {/* <HorizontalPlane
              onChange={setXZ}
              onNearClick={() => {
                menu.open = false
                scope.selected = null
                clearIlluminatedMaterials()
              }}
              onNearHover={() => {
                if (menu.open) return
                scope.hovered = null
                if (scope.selected === null) clearIlluminatedMaterials()
              }}
            /> */}
            {/* {shadows && (
              <>
                <GroundCircle />
                <ShadowPlane />
              </>
            )} */}
            {/* {boundary && <lineLoop args={[boundary, boundaryMaterial]} />} */}
            {/* <Effects /> */}
            <ContextBridge>{children}</ContextBridge>
          </Fragment>
        )
      },
      render: (ctx?: WebGLRenderingContext, matrix?: number[]): void => {
        advance(Date.now(), true)
        map.triggerRepaint()
      },
    }

    map.on("style.load", () => {
      // map.setFog({}) // Set the default atmosphere style
      map.addLayer(customLayer)
    })

    return () => root.unmount()
  }, [map, mapElement, root, setMap, setRoot])

  return (
    <div className="absolute h-full w-full">
      <div ref={setMapElement} className="h-full w-full" />
    </div>
  )
}

export default MapNgThreeInit
