import { useRouting } from "@/hooks/routing"
import { useContext } from "@/stores/context"
import { useHouses } from "@/stores/houses"
import { initScopes } from "@/stores/scope"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense, useEffect } from "react"
import Loader3D from "../ui-3d/Loader3D"
import SiteBuilding from "./building/SiteBuilding"

const SiteThreeApp = () => {
  const { buildingId, levelIndex } = useContext()
  useRouting()
  useEffect(() => initScopes(), [buildingId, levelIndex])
  const houses = useHouses()

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
