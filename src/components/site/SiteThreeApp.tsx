import { House as HouseT } from "@/data/house"
import context, { useContext } from "@/stores/context"
import { useHouse, useHouses } from "@/stores/houses"
import { ScopeTypeEnum, setScopeType } from "@/stores/scope"
import { mapRR } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense, useEffect } from "react"
import BuildingHouse from "../building/BuildingHouse"
import Loader3D from "../ui-3d/Loader3D"
import SiteHouse from "./SiteHouse"

const BuildingMode = ({ buildingId }: { buildingId: string }) => {
  const house = useHouse(buildingId)

  return (
    <Suspense key={house.id} fallback={<Loader3D />}>
      <BuildingHouse house={house as HouseT} />
    </Suspense>
  )
}

const SiteMode = () => {
  const houses = useHouses()

  return (
    <group>
      {pipe(
        houses,
        mapRR((house) => (
          <Suspense key={house.id} fallback={<Loader3D />}>
            <SiteHouse house={house as HouseT} />
          </Suspense>
        )),
        toReadonlyArray
      )}
    </group>
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

  return !buildingId ? <SiteMode /> : <BuildingMode buildingId={buildingId} />
}

export default SiteThreeApp
