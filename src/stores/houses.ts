import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import { Houses } from "@/data/house"
import { LoadedModule, Module } from "@/data/module"
import { snapToGrid, SSR, useGLTF } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  reduceWithIndex,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { MutableRefObject, useCallback, useEffect } from "react"
import { Group } from "three"
import { proxy, subscribe, useSnapshot } from "valtio"
import { setCameraEnabled } from "./camera"
import { useContext } from "./context"
import pointer from "./pointer"
import scopes, { ScopeTypeEnum } from "./scope"

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

export const useBuildingDna = (buildingId: string) => {
  const { dna } = useSnapshot(houses[buildingId])
  return dna
}

export const useHouseType = (houseId: string) => {
  const house = useHouse(houseId)
  const { houseTypes } = useSystemsData()
  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
  if (!houseType) throw new Error("houseType not found")
  return houseType
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
    if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) return
    if (first) {
      setCameraEnabled(false)
    }

    const [px, pz] = pointer.xz
    const [x, z] = houses[houseId].position
    const [dx, dz] = [px - x, pz - z].map(snapToGrid)

    for (let k of scopes.primary.selected) {
      houses[k].position[0] += dx
      houses[k].position[1] += dz
    }

    invalidate()

    if (last) setCameraEnabled(true)
  }
}

export const useFocusedBuilding = () => {
  const houses = useHouses()
  const { buildingId } = useContext()
  return buildingId ? houses[buildingId] : null
}

export const useBuildingModules = (buildingId: string) => {
  const { modules: sysModules } = useSystemsData()
  const house = useSnapshot(houses)[buildingId]

  const modules = pipe(
    house.dna,
    filterMap((dna) =>
      pipe(
        sysModules,
        findFirst(
          (sysM: Module) => sysM.systemId === house.systemId && sysM.dna === dna
        )
      )
    )
  )
  const gltfs = useGLTF(modules.map(({ modelUrl }) => modelUrl))
  return modules.map(({ modelUrl, ...rest }, i) => ({
    ...rest,
    gltf: gltfs[i],
  }))
}

export const modulesToRows = (
  modules: readonly LoadedModule[]
): LoadedModule[][] => {
  const jumpIndices = pipe(
    modules,
    filterMapWithIndex((i, m) =>
      m.structuredDna.positionType === "END" ? some(i) : none
    ),
    filterWithIndex((i) => i % 2 === 0)
  )

  return pipe(
    modules,
    reduceWithIndex(
      [],
      (moduleIndex, modules: LoadedModule[][], module: LoadedModule) => {
        return jumpIndices.includes(moduleIndex)
          ? [...modules, [{ ...module, moduleIndex }]]
          : produce(
              (draft) =>
                void draft[draft.length - 1].push({ ...module, moduleIndex })
            )(modules)
      }
    )
  )
}

export const useBuildingRows = (buildingId: string) => {
  const houseModules = useBuildingModules(buildingId)
  return modulesToRows(houseModules)
}

export const useHoverHouse = (id: string) => {
  return (hover: boolean = true) => {
    if (scopes.primary.type === ScopeTypeEnum.Enum.HOUSE) {
      if (scopes.primary.hovered !== id && hover) {
        scopes.primary.hovered = id
      } else if (scopes.primary.hovered === id && !hover) {
        scopes.primary.hovered = null
      }
    }
  }
}

export default houses
