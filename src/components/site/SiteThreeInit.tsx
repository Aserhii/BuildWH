import { RaycasterLayer } from "@/CONSTANTS"
import { SystemsDataContext } from "@/contexts/SystemsData"
import { setPointer } from "@/stores/context"
import scopes from "@/stores/scope"
import { useSettings } from "@/stores/settings"
import { useContextBridge } from "@react-three/drei"
// import { store, useMapBoundary } from "@/store"
import { Canvas } from "@react-three/fiber"
import React, { PropsWithChildren } from "react"
import { BasicShadowMap } from "three"
import Effects from "../effects"
import { HorizontalPlane } from "../ui-3d/HorizontalPlane"
import Lighting from "../ui-3d/Lighting"
import RectangularGrid from "../ui-3d/RectangularGrid"
import GroundCircle from "./GroundCircle"
import ShadowPlane from "./ShadowPlane"
import SiteCamControls from "./SiteCamControls"

type Props = PropsWithChildren<{}>

const SiteThreeInit = (props: Props) => {
  const { children } = props
  const { orthographic, shadows } = useSettings()
  const ContextBridge = useContextBridge(SystemsDataContext)

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
        raycaster.layers.enable(RaycasterLayer.clickable)
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
          scopes.primary.selected = []
          scopes.secondary.selected = []
          // store.contextMenu = null
        }}
        onNearHover={() => {
          scopes.primary.hovered = null
          scopes.secondary.hovered = null
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
