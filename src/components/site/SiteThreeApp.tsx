import { useRouting } from "@/hooks/routing"
import { useSiteContext } from "@/stores/context"
import highlights, { clearIlluminatedMaterials } from "@/stores/highlights"
import { useHouses } from "@/stores/houses"
import scope from "@/stores/scope"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense, useEffect } from "react"
import Loader3D from "../ui-3d/Loader3D"
import SiteBuilding from "./building/SiteBuilding"

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

  return buildingId === null ? (
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
  )
}

export default SiteThreeApp
