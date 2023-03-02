import {
  BUILDX_LOCAL_STORAGE_HOUSES_KEY,
  SetTypeSpec,
  setTypeSpecs,
} from "@/CONSTANTS"
import { findCollisions, House } from "@/data/house"
import { Module } from "@/data/module"
import { moduleLayout } from "@/data/moduleLayout"
import {
  chunksOfRNA,
  filterMapWithIndexRR,
  filterRR,
  mapO,
  mapRA,
  mapWithIndexRA,
  mapRR,
  snapToGrid,
  SSR,
  chunksOfRA,
  filterMapRR,
  findA2,
} from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { transpose } from "fp-ts-std/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { chunksOf, range } from "fp-ts/lib/NonEmptyArray"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  findIndex,
} from "fp-ts/lib/ReadonlyArray"
import { MutableRefObject, useCallback, useEffect, useMemo } from "react"
import { Group, Plane } from "three"
import { subscribe, useSnapshot } from "valtio"
import { derive } from "valtio/utils"
import { ScopeTypeEnum, setCameraEnabled, store } from "."
import { systemsData, useSystemsData } from "./systems"

export type HorizontalSectionCut = {
  levelType: string
  height: number
  totalHeight: number
  heightIndex: number
  plane: Plane
}

export const addHouse = (house: House) => void (store.houses[house.id] = house)

export const useCollisions = () => {
  const snap = useSnapshot(store)
  const { modules, houseTypes } = useSystemsData()
  return useMemo(() => {
    return findCollisions(store.houses, houseTypes, modules)
  }, [snap.houses, houseTypes, modules])
}

export const useHouse = (houseId: string) => {
  const { houses } = useSnapshot(store)
  return houses[houseId]
}

export const useHouseModules = (houseId: string) => {
  const { houseTypes, modules: sysModules } = useSystemsData()
  const { houses } = useSnapshot(store)
  const house = houses[houseId]
  return !house
    ? []
    : pipe(
        houseTypes,
        findFirst((ht) => ht.id === house.houseTypeId),
        mapO((houseType) => house.dna ?? houseType.dna),
        mapO(
          flow(
            filterMap((dna) =>
              pipe(
                sysModules,
                findFirst(
                  (sysM: Module) =>
                    sysM.systemId === house.systemId && sysM.dna === dna
                )
              )
            )
          )
        ),
        getOrElse((): readonly Module[] => [])
      )
}

export const useLevelModuleIndices = (
  houseId: string,
  moduleIndex: number
): number[] => {
  const modules = useHouseModules(houseId)
  const layout = moduleLayout(modules)

  const layoutHeight = layout.gridBounds[1] + 1
  const heightIndex = moduleIndex % layoutHeight

  const chunks = pipe(
    range(0, modules.length - 1),
    chunksOf(layoutHeight),
    transpose
  ) as number[][]

  return chunks[heightIndex]
}

export const useUpdatePosition = (
  houseId: string,
  groupRef: MutableRefObject<Group | undefined>
): Handler<"drag", ThreeEvent<PointerEvent>> => {
  const invalidate = useThree((three) => three.invalidate)

  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = store.houses[houseId].position
    groupRef.current.position.set(x, 0, z)
  }, [houseId])

  useEffect(
    () => subscribe(store.houses[houseId].position, onPositionUpdate),
    [houseId, onPositionUpdate]
  )
  useEffect(onPositionUpdate, [onPositionUpdate])

  return ({ first, last }) => {
    if (store.scope.type !== ScopeTypeEnum.Enum.HOUSE) return
    if (first) {
      setCameraEnabled(false)
    }

    const [px, pz] = store.horizontalPointer
    const [x, z] = store.houses[houseId].position
    const [dx, dz] = [px - x, pz - z].map(snapToGrid)

    for (let k of store.scope.selected) {
      store.houses[k].position[0] += dx
      store.houses[k].position[1] += dz
    }

    invalidate()

    if (last) setCameraEnabled(true)
  }
}

export const useHouseType = (houseId: string) => {
  const house = useHouse(houseId)
  const { houseTypes } = useSystemsData()
  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
  if (!houseType) throw new Error("houseType not found")
  return houseType
}

export const initialHouses = SSR
  ? {}
  : JSON.parse(localStorage.getItem(BUILDX_LOCAL_STORAGE_HOUSES_KEY) ?? "{}")

export const useLocallyStoredHouses = () => {
  useEffect(
    subscribe(store.houses, () => {
      localStorage.setItem(
        BUILDX_LOCAL_STORAGE_HOUSES_KEY,
        JSON.stringify(store.houses)
      )
    }),
    []
  )
}

// put me in a separate module maybe
export const houseLayouts = derive({
  houses: async (get) => {
    const sysData = await get(systemsData)
    const sysModules = await sysData.modules
    const houses = get(store.houses)

    return pipe(
      houses,
      mapRR((house) => {
        const modules = pipe(
          house.dna,
          filterMap((dna) =>
            pipe(
              sysModules,
              findFirst(
                (sysM: Module) =>
                  sysM.systemId === house.systemId && sysM.dna === dna
              )
            )
          )
        )
        const layout = moduleLayout(modules)
        const layoutHeight = layout.gridBounds[1] + 1
        const moduleDnaChunks = pipe(
          modules,
          mapRA((module) => module.dna),
          chunksOfRA(layoutHeight)
        ) as unknown as string[][]

        const sets = pipe(
          setTypeSpecs,
          filterMapRR((spec) => {
            const indices = pipe(
              moduleDnaChunks,
              findA2<string>((a, b) => b?.startsWith(a) ?? false)(spec.target)
            )
            return indices.length === 0
              ? none
              : some({
                  ...spec,
                  indices,
                })
          })
        )

        // filterMapRR your set types structure
        // startIndices: number[]
        // map targets from chunked to flat
        //    i.e. couplets [dna, index]

        return {
          ...house,
          modules,
          layout,
          sets,
        }
      })
    )
  },
})
