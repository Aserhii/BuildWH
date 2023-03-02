import context, { useContext } from "@/stores/context"
import { useHouses } from "@/stores/houses"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Fragment, Suspense, useEffect } from "react"
import BuildingBuilding from "../building/BuildingBuilding"
import Loader3D from "../ui-3d/Loader3D"
import SiteBuilding from "./SiteBuilding"

const BuildingMode = ({ buildingId }: { buildingId: string }) => {
  return <BuildingBuilding id={buildingId} />
}

const SiteMode = () => {
  const houses = useHouses()

  return (
    <Fragment>
      <group>
        {pipe(
          keys(houses),
          mapRA((id) => <SiteBuilding key={id} id={id} />)
        )}
      </group>
    </Fragment>
  )
}

const SiteThreeApp = () => {
  const { buildingId } = useContext()

  useEffect(() => {
    if (buildingId === null) {
      scopes.primary = {
        type: ScopeTypeEnum.Enum.HOUSE,
        hovered: null,
        selected: [],
      }
    } else {
      scopes.primary = {
        type: ScopeTypeEnum.Enum.ELEMENT,
        hovered: null,
        selected: [],
      }
    }
    context.outlined = []
  }, [buildingId])

  return (
    <Suspense fallback={<Loader3D />}>
      {!buildingId ? <SiteMode /> : <BuildingMode buildingId={buildingId} />}
    </Suspense>
  )
}

export default SiteThreeApp
