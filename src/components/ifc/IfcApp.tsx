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
import IfcBuilding from "./IfcBuilding"

const IfcApp = () => {
  const { buildingId, levelIndex } = useSiteContext()

  useEffect(() => {
    highlights.outlined = []
    clearIlluminatedMaterials()
    scope.hovered = null
    scope.selected = null
  }, [buildingId, levelIndex])

  const houses = useHouses()

  useRouting()

  console.log("this is it!")

  return buildingId === null ? (
    <group>
      {pipe(
        keys(houses),
        mapRA((id) => (
          <Suspense key={id} fallback={<Loader3D />}>
            <IfcBuilding key={id} id={id} />
          </Suspense>
        ))
      )}
    </group>
  ) : (
    <Suspense fallback={<Loader3D />}>
      <IfcBuilding key={buildingId} id={buildingId} />
    </Suspense>
  )
}

export default IfcApp
