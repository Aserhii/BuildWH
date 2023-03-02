import { useRouting } from "@/hooks/routing"
import { useSiteContext } from "@/stores/context"
import highlights, { clearIlluminatedMaterials } from "@/stores/highlights"
import { useHouses } from "@/stores/houses"
import store, { useMap } from "@/stores/mapSync"
import scope from "@/stores/scope"
import { mapRA } from "@/utils"
import { useThree } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Fragment, Suspense, useEffect, useRef } from "react"
import Loader3D from "../ui-3d/Loader3D"
import SiteBuilding from "./building/SiteBuilding"
import CameraSync from "../../threebox/camera/CameraSync"
import { Group } from "three"

const SiteThreeApp = () => {
  const { buildingId, levelIndex } = useSiteContext()

  useEffect(() => {
    highlights.outlined = []
    clearIlluminatedMaterials()
    scope.hovered = null
    scope.selected = null
  }, [buildingId, levelIndex])

  const houses = useHouses()

  useRouting()

  const [map] = useMap()
  const camera = useThree((t) => t.camera)

  const worldRef = useRef<Group>(null)

  useEffect(() => {
    if (!store.cameraSync && worldRef.current) {
      store.cameraSync = new CameraSync(map, camera, worldRef.current)
    }
  }, [camera, map])

  console.log("site three app")
  console.log(houses)

  return (
    <group ref={worldRef}>
      {buildingId === null ? (
        <Fragment>
          {pipe(
            keys(houses),
            mapRA((id) => (
              <Suspense key={id} fallback={<Loader3D />}>
                <SiteBuilding id={id} />
              </Suspense>
            ))
          )}
        </Fragment>
      ) : (
        <Suspense fallback={<Loader3D />}>
          <SiteBuilding id={buildingId} />
        </Suspense>
      )}
    </group>
  )
}

export default SiteThreeApp
