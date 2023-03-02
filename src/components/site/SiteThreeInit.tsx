import { RaycasterLayer } from "@/CONSTANTS"
import { BuildSystemsDataContext } from "@/contexts/BuildSystemsData"
import { setPointer } from "@/stores/context"
import scope from "@/stores/scope"
import { useSettings } from "@/stores/settings"
import { useContextBridge } from "@react-three/drei"
// import { store, useMapBoundary } from "@/store"
import { Canvas } from "@react-three/fiber"
import React, { PropsWithChildren, Suspense } from "react"
import { BasicShadowMap } from "three"
import { HorizontalPlane } from "../ui-3d/HorizontalPlane"
import Lighting from "../ui-3d/Lighting"
import RectangularGrid from "../ui-3d/RectangularGrid"
import Effects from "./Effects"
import GroundCircle from "./GroundCircle"
import ShadowPlane from "./ShadowPlane"
import SiteCamControls from "./SiteCamControls"

type Props = PropsWithChildren<{}>

const SiteThreeInit = (props: Props) => {
  const { children } = props
  const { orthographic, shadows } = useSettings()
  const ContextBridge = useContextBridge(BuildSystemsDataContext)

  // Re-initialize canvas if settings like orthographic camera are changed
  // const [unmountToReinitialize, setUnmountToReinitialize] = useState(true)

  // useEffect(() => {
  //   setUnmountToReinitialize(true)
  //   setTimeout(() => {
  //     setUnmountToReinitialize(false)
  //   }, 100)
  // }, [orthographic, setUnmountToReinitialize])

  // const [boundary, boundaryMaterial] = useMapBoundary()

  // if (unmountToReinitialize) {
  //   return (
  //     <div className="relative flex h-full w-full items-center justify-center">
  //       <Loader />
  //     </div>
  //   )
  // }
  return (
    <Canvas
      frameloop="demand"
      mode="concurrent"
      shadows={{ enabled: true, type: BasicShadowMap }}
      onCreated={({ gl, raycaster }) => {
        gl.localClippingEnabled = true
        raycaster.layers.enableAll()
        raycaster.layers.disable(RaycasterLayer.non_clickable)
      }}
    >
      <axesHelper />
      <Lighting />
      {/* <group position={[0.5, 0, 0.5]}> */}
      <RectangularGrid
        x={{ cells: 61, size: 1 }}
        z={{ cells: 61, size: 1 }}
        color="#ababab"
      />
      {/* </group> */}
      <HorizontalPlane
        onChange={setPointer}
        onNearClick={() => {
          scope.selected = []
          // store.contextMenu = null
        }}
        onNearHover={() => {
          scope.hovered = null
        }}
      />
      {shadows && (
        <>
          <GroundCircle />
          <ShadowPlane />
        </>
      )}
      {/* {boundary && <lineLoop args={[boundary, boundaryMaterial]} />} */}
      <Effects />
      <SiteCamControls />
      <ContextBridge>{children}</ContextBridge>
    </Canvas>
  )
}

export default SiteThreeInit
