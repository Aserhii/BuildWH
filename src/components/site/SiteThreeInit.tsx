import { DEFAULT_ORIGIN, RaycasterLayer } from "@/CONSTANTS"
import { SystemsDataContext } from "@/contexts/SystemsData"
import { useMapBoundary } from "@/stores/map"
import { useMapSyncMap, useR3FRoot } from "@/stores/mapSync"
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
import { BasicShadowMap, sRGBEncoding } from "three"
import Lighting from "../ui-3d/Lighting"
import * as THREE from "three"

extend(THREE)

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""

type Props = PropsWithChildren<{}>

const SiteThreeInit = (props: Props) => {
  const { children } = props
  // const { orthographic, shadows } = useSettings()
  const ContextBridge = useContextBridge(SystemsDataContext)

  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null)

  const [root, setRoot] = useR3FRoot()

  const [map, setMap] = useMapSyncMap()

  // Re-initialize canvas if settings like orthographic camera are changed
  // const [unmountToReinitialize, setUnmountToReinitialize] = useState(true)

  // useEffect(() => {
  //   setUnmountToReinitialize(true)
  //   setTimeout(() => {
  //     setUnmountToReinitialize(false)
  //   }, 100)
  // }, [orthographic, setUnmountToReinitialize])

  const [boundary, boundaryMaterial] = useMapBoundary()

  // if (unmountToReinitialize) {
  //   return (
  //     <div className="relative flex h-full w-full items-center justify-center">
  //       <Loader />
  //     </div>
  //   )
  // }
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
          interactive: true,
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
          shadows: {
            enabled: true,
            type: BasicShadowMap,
          },
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

            state.gl.localClippingEnabled = true
            // state.raycaster.layers.enable(RaycasterLayer.clickable)
            // state.raycaster.layers.disable(RaycasterLayer.non_clickable)
          },
        })

        map.repaint = false

        root.render(
          <Fragment>
            {/* <MapboxThreeAppThreeTree /> */}
            {/* <axesHelper /> */}
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

    const minZoom = 12

    const buildingsLayer: AnyLayer = {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: minZoom,
      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "select"], false],
          "lightgreen",
          ["boolean", ["feature-state", "hover"], false],
          "lightblue",
          "#aaa",
        ],

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          minZoom,
          0,
          minZoom + 0.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          minZoom,
          0,
          minZoom + 0.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.9,
      },
    }

    map.on("style.load", () => {
      // map.setFog({}) // Set the default atmosphere style
      map.addLayer(buildingsLayer)
      map.addLayer(customLayer)

      const style = map.getStyle()
      console.log(style)
    })

    return () => root.unmount()
  }, [map, mapElement, root, setMap, setRoot])

  return (
    <div className="absolute h-full w-full">
      <div ref={setMapElement} className="h-full w-full" />
    </div>
  )

  // return (
  //   <Canvas
  //     frameloop="demand"
  //     shadows={{ enabled: true, type: BasicShadowMap }}
  //     onCreated={({ gl, raycaster }) => {
  //       gl.localClippingEnabled = true
  //       raycaster.layers.enable(RaycasterLayer.clickable)
  //       raycaster.layers.disable(RaycasterLayer.non_clickable)
  //     }}
  //   >
  //     <axesHelper />
  //     <Lighting />
  //     {/* <group position={[0.5, 0, 0.5]}> */}
  //     <RectangularGrid
  //       x={{ cells: 61, size: 1 }}
  //       z={{ cells: 61, size: 1 }}
  //       color="#ababab"
  //     />
  //     {/* </group> */}
  //     <HorizontalPlane
  //       onChange={setXZ}
  //       onNearClick={() => {
  //         menu.open = false
  //         scope.selected = null
  //         clearIlluminatedMaterials()
  //       }}
  //       onNearHover={() => {
  //         if (menu.open) return
  //         scope.hovered = null
  //         if (scope.selected === null) clearIlluminatedMaterials()
  //       }}
  //     />
  //     {shadows && (
  //       <>
  //         <GroundCircle />
  //         <ShadowPlane />
  //       </>
  //     )}
  //     {boundary && <lineLoop args={[boundary, boundaryMaterial]} />}
  //     <Effects />
  //     <ContextBridge>
  //       <SiteCamControls />
  //       {children}
  //     </ContextBridge>
  //   </Canvas>
  // )
}

export default SiteThreeInit
