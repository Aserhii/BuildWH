import { useSystemsData } from "@/contexts/SystemsData"
import { House as HouseT } from "@/data/house"
import context, { useContext } from "@/stores/context"
import { useHouse, useHouses } from "@/stores/houses"
import { ScopeTypeEnum, setScopeType } from "@/stores/scope"
import { mapRR } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import React, { Fragment, Suspense, useEffect } from "react"
import StretchBuildingHouse from "../building/StretchBuildingHouse"
import Loader3D from "../ui-3d/Loader3D"
import SiteHouse from "./SiteHouse"

const BuildingMode = ({ buildingId }: { buildingId: string }) => {
  const house = useHouse(buildingId)

  return <StretchBuildingHouse house={house as HouseT} />
}

const SiteMode = () => {
  const houses = useHouses()

  return (
    <Fragment>
      <group>
        {pipe(
          houses,
          mapRR((house) => (
            <SiteHouse key={house.id} house={house as HouseT} />
          )),
          toReadonlyArray
        )}
      </group>
    </Fragment>
  )
}

const SiteThreeApp = () => {
  const { buildingId } = useContext()

  useEffect(() => {
    if (buildingId === null) {
      setScopeType(ScopeTypeEnum.Enum.HOUSE)
    } else {
      setScopeType(ScopeTypeEnum.Enum.ELEMENT)
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
