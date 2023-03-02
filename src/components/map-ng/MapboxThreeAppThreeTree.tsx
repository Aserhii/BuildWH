import { DEFAULT_ORIGIN } from "@/CONSTANTS"
import store, { useMap } from "@/stores/mapSync"
import { useThree } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useMemo, useRef } from "react"
import { DoubleSide, Group, Mesh, Plane, Vector3 } from "three"
import CameraSync from "../../threebox/camera/CameraSync"
import utils from "../../threebox/utils/utils"
import SiteThreeApp from "../site/SiteThreeApp"

const MapboxThreeAppThreeTree = () => {
  const worldRef = useRef<Group>(null)

  // const [enableInteractions, disableInteractions] = useInteractions()

  // const bind = useGesture({
  //   onDrag: ({ first, last, delta: [dx, dy] }) => {
  //     if (first) {
  //       disableInteractions()
  //     }
  //     if (last) {
  //       enableInteractions()
  //     }

  //     if (!meshRef.current) return

  //     meshRef.current.rotation.y += dx / 100
  //     meshRef.current.rotation.x += dy / 100
  //   },
  // })

  const [map] = useMap()
  const camera = useThree((t) => t.camera)

  useEffect(() => {
    if (!store.cameraSync && worldRef.current) {
      store.cameraSync = new CameraSync(map, camera, worldRef.current)
    }
  }, [camera, map])

  const [lat, lng] = DEFAULT_ORIGIN

  const mapCenterUnits = pipe(utils.projectToWorld([lng, lat]), (v3) => {
    // console.log(v3)
    // v3.z += SIZE / 2
    return v3
  })

  const UNITS_MULTIPLIER = utils.projectedUnitsPerMeter(lat)

  const SIZE = UNITS_MULTIPLIER * 100

  const groundPlane = useMemo(() => {
    return new Plane(new Vector3(0, 0, 1), SIZE / 2)
  }, [SIZE])

  return (
    <group ref={worldRef}>
      {/* <SiteThreeApp /> */}
      <mesh
        //  {...(bind() as any)}
        position={mapCenterUnits}
      >
        <boxBufferGeometry args={[SIZE, SIZE, SIZE]} />
        <meshBasicMaterial
          color="tomato"
          side={DoubleSide}
          clippingPlanes={[groundPlane]}
        />
      </mesh>
    </group>
  )
}

export default MapboxThreeAppThreeTree
