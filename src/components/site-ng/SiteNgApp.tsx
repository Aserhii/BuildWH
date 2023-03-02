import { useSystemData } from "@/contexts/SystemsData"
import { useRouting } from "@/hooks/routing"
import { useSiteContext } from "@/stores/context"
import mapSync, { useMapSyncMap } from "@/stores/mapSync"
import { useThree } from "@react-three/fiber"
import dynamic from "next/dynamic"
import { Suspense, useEffect, useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
import Loader3D from "../ui-3d/Loader3D"
import CameraSync from "@/threebox/camera/CameraSync"
import { DEFAULT_ORIGIN } from "@/CONSTANTS"
import utils from "@/threebox/utils/utils"
import { pipe } from "fp-ts/lib/function"
import { useHouses } from "@/stores/houses"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import { mapRA } from "@/utils"

// const IfcModule = dynamic(() => import("../ifc/IfcModule"), { ssr: false })
const IfcHouse = dynamic(() => import("../ifc/IfcHouse"), { ssr: false })

const SiteNgApp = () => {
  // const { buildingId, levelIndex } = useSiteContext()
  // const { modules } = useSystemData({})
  const worldRef = useRef<Group>(null)

  useRouting()

  const [map] = useMapSyncMap()
  const camera = useThree((t) => t.camera)

  useEffect(() => {
    if (!mapSync.cameraSync && worldRef.current) {
      mapSync.cameraSync = new CameraSync(map, camera, worldRef.current)
    }
  }, [camera, map])

  const houses = useHouses()

  const [lat, lng] = DEFAULT_ORIGIN

  const mapCenterUnits = pipe(utils.projectToWorld([lng, lat]), (v3) => {
    return v3
  })

  const UNITS_MULTIPLIER = utils.projectedUnitsPerMeter(lat)

  const SIZE = UNITS_MULTIPLIER * 100

  const groundPlane = useMemo(() => {
    return new Plane(new Vector3(0, 0, 1), SIZE / 2)
  }, [SIZE])

  console.log(UNITS_MULTIPLIER)
  return (
    <group>
      {pipe(
        keys(houses),
        mapRA((id) => (
          <Suspense key={id} fallback={<Loader3D />}>
            <IfcHouse id={id} />
          </Suspense>
        ))
      )}
    </group>
  )
  // return (
  //   <group ref={worldRef}>
  //     <group position={mapCenterUnits}>
  //       <Suspense fallback={<Loader3D />}>
  //         <IfcModule
  //           module={modules[0]}
  //           scale={UNITS_MULTIPLIER}
  //           rotation-x={Math.PI / 2}
  //         />
  //       </Suspense>
  //     </group>
  //   </group>
  // )

  // return buildingId === null ? (
  //   <group>
  //     {pipe(
  //       keys(houses),
  //       mapRA((id) => (
  //         <Suspense key={id} fallback={<Loader3D />}>
  //           <IfcModule />
  //         </Suspense>
  //       ))
  //     )}
  //   </group>
  // ) : (
  //   <Suspense fallback={<Loader3D />}>
  //     <SiteBuilding id={buildingId} />
  //   </Suspense>
  // )
}
// const SiteNgApp = () => {
//   const worldRef = useRef<Group>(null)

//   const systemsData = useSystemsData()

//   console.log(systemsData)

//   const [map] = useMap()
//   const camera = useThree((t) => t.camera)

//   useEffect(() => {
//     if (!mapSync.cameraSync && worldRef.current) {
//       mapSync.cameraSync = new CameraSync(map, camera, worldRef.current)
//     }
//   }, [camera, map])

//   const [lat, lng] = DEFAULT_ORIGIN

//   const mapCenterUnits = pipe(utils.projectToWorld([lng, lat]), (v3) => {
//     return v3
//   })

//   const UNITS_MULTIPLIER = utils.projectedUnitsPerMeter(lat)

//   const SIZE = UNITS_MULTIPLIER * 100

//   const groundPlane = useMemo(() => {
//     return new Plane(new Vector3(0, 0, 1), SIZE / 2)
//   }, [SIZE])

//   return (
//     <group ref={worldRef}>
//       <mesh
//         //  {...(bind() as any)}
//         position={mapCenterUnits}
//       >
//         <boxBufferGeometry args={[SIZE, SIZE, SIZE]} />
//         <meshBasicMaterial
//           color="tomato"
//           side={DoubleSide}
//           clippingPlanes={[groundPlane]}
//         />
//       </mesh>
//     </group>
//   )
// }

export default SiteNgApp
