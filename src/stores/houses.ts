import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { Houses } from "@/data/house"
import { snapToGrid, SSR } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { MutableRefObject, useCallback, useEffect } from "react"
import { Group } from "three"
import { proxy, subscribe, useSnapshot } from "valtio"
import { setCameraEnabled } from "./camera"
import context from "./context"
import scope, { ScopeTypeEnum } from "./scope"
import { useSystemsData } from "./systems"

export const getInitialHouses = () =>
  SSR
    ? {}
    : JSON.parse(localStorage.getItem(BUILDX_LOCAL_STORAGE_HOUSES_KEY) ?? "{}")

const houses = proxy<Houses>(getInitialHouses())

export const useLocallyStoredHouses = () => {
  useEffect(
    subscribe(houses, () => {
      localStorage.setItem(
        BUILDX_LOCAL_STORAGE_HOUSES_KEY,
        JSON.stringify(houses)
      )
    }),
    []
  )
}

export const useHouses = () => useSnapshot(houses)

export const useHouse = (houseId: string) => {
  const housesSnap = useSnapshot(houses)
  return housesSnap[houseId]
}

export const useHouseType = (houseId: string) => {
  const house = useHouse(houseId)
  const { houseTypes } = useSystemsData()
  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
  if (!houseType) throw new Error("houseType not found")
  return houseType
}

export const useResetHouse = (houseId: string) => {
  const houseType = useHouseType(houseId)

  return () => {
    houses[houseId].dna = houseType.dna as string[]
  }
}

export const useUpdatePosition = (
  houseId: string,
  groupRef: MutableRefObject<Group | undefined>
): Handler<"drag", ThreeEvent<PointerEvent>> => {
  const invalidate = useThree((three) => three.invalidate)

  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = houses[houseId].position
    groupRef.current.position.set(x, 0, z)
  }, [houseId])

  useEffect(
    () => subscribe(houses[houseId].position, onPositionUpdate),
    [houseId, onPositionUpdate]
  )
  useEffect(onPositionUpdate, [onPositionUpdate])

  return ({ first, last }) => {
    if (scope.type !== ScopeTypeEnum.Enum.HOUSE) return
    if (first) {
      setCameraEnabled(false)
    }

    const [px, pz] = context.pointer
    const [x, z] = houses[houseId].position
    const [dx, dz] = [px - x, pz - z].map(snapToGrid)

    for (let k of scope.selected) {
      houses[k].position[0] += dx
      houses[k].position[1] += dz
    }

    invalidate()

    if (last) setCameraEnabled(true)
  }
}

export default houses
