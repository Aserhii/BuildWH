import { RaycasterLayer } from "@/CONSTANTS"
import { SystemsDataContext } from "@/contexts/SystemsData"
import { clearIlluminatedMaterials } from "@/stores/highlights"
import { useMapBoundary } from "@/stores/map"
import menu from "@/stores/menu"
import { setXZ } from "@/stores/pointer"
import scope from "@/stores/scope"
import { useSettings } from "@/stores/settings"
import { useContextBridge } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { PropsWithChildren } from "react"
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
  const ContextBridge = useContextBridge(SystemsDataContext)

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

  return (
    <Canvas
      frameloop="demand"
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
        onChange={setXZ}
        onNearClick={() => {
          menu.open = false
          if (!scope.locked) scope.selected = null
          clearIlluminatedMaterials()
        }}
        onNearHover={() => {
          if (menu.open) return
          if (!scope.locked) scope.hovered = null
          if (scope.selected === null) clearIlluminatedMaterials()
        }}
      />
      {shadows && (
        <>
          <GroundCircle />
          <ShadowPlane />
        </>
      )}
      {boundary && <lineLoop args={[boundary, boundaryMaterial]} />}
      <Effects />
      <ContextBridge>
        <SiteCamControls />
        {children}
      </ContextBridge>
    </Canvas>
  )
}

export default SiteThreeInit
