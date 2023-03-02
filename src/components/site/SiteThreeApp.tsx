import { useRouting } from "@/hooks/routing"
import { useSiteContext } from "@/stores/context"
import highlights, { clearIlluminatedMaterials } from "@/stores/highlights"
import { useHouses } from "@/stores/houses"
import mapSync, { useMapSyncMap } from "@/stores/mapSync"
import scope from "@/stores/scope"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense, useEffect, useRef } from "react"
import { Group } from "three"
import Loader3D from "../ui-3d/Loader3D"
import SiteBuilding from "./building/SiteBuilding"
import CameraSync from "@/threebox/camera/CameraSync"
import { useThree } from "@react-three/fiber"
import { DEFAULT_ORIGIN } from "@/CONSTANTS"
import utils from "@/threebox/utils/utils"

const SiteThreeApp = () => {
  const worldRef = useRef<Group>(null)
  const { buildingId, levelIndex } = useSiteContext()

  useEffect(() => {
    highlights.outlined = []
    clearIlluminatedMaterials()
    scope.hovered = null
    scope.selected = null
  }, [buildingId, levelIndex])

  const [map] = useMapSyncMap()
  const camera = useThree((t) => t.camera)

  useEffect(() => {
    if (!mapSync.cameraSync && worldRef.current) {
      mapSync.cameraSync = new CameraSync(map, camera, worldRef.current)
    }
  }, [camera, map])

  const houses = useHouses()

  useRouting()

  const [lat, lng] = DEFAULT_ORIGIN

  const mapCenter = pipe(utils.projectToWorld([lng, lat]), (v3) => {
    return v3
  })

  const perMeter = utils.projectedUnitsPerMeter(lat)

  return (
    <group ref={worldRef}>
      <group
        scale={perMeter}
        // scale={0.5}
        position={mapCenter}
        rotation-x={Math.PI / 2}
      >
        {buildingId === null ? (
          <group>
            {pipe(
              keys(houses),
              mapRA((id) => (
                <Suspense key={id} fallback={<Loader3D />}>
                  <SiteBuilding id={id} />
                </Suspense>
              ))
            )}
          </group>
        ) : (
          <Suspense fallback={<Loader3D />}>
            <SiteBuilding id={buildingId} />
          </Suspense>
        )}
      </group>
    </group>
  )
}

export default SiteThreeApp
