import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import { Houses } from "@/data/house"
import { LoadedModule, Module } from "@/data/module"
import { snapToGrid, SSR, useGLTF } from "@/utils"
import { invalidate, ThreeEvent } from "@react-three/fiber"
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
import { MutableRefObject, useCallback, useEffect, useRef } from "react"
import { Group, Matrix4, Vector3 } from "three"
import { proxy, subscribe, useSnapshot } from "valtio"
import { subscribeKey } from "valtio/utils"
import { setCameraEnabled } from "./camera"
import {
  EditModeEnum,
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "./context"
import pointer from "./pointer"
import scope from "./scope"

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

export const usePositionRotation = (
  buildingId: string,
  groupRef: MutableRefObject<Group | undefined>
) => {
  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = houses[buildingId].position
    groupRef.current.position.set(x, 0, z)
  }, [buildingId])

  useEffect(() => {
    onPositionUpdate()
    return subscribe(houses[buildingId].position, onPositionUpdate)
  }, [buildingId, onPositionUpdate])

  const onRotationUpdate = useCallback(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.set(0, houses[buildingId].rotation, 0)
  }, [buildingId])

  useEffect(() => {
    onRotationUpdate()
    return subscribeKey(houses[buildingId], "rotation", onRotationUpdate)
  }, [buildingId, onRotationUpdate])

  const contextMode = useSiteContextMode()
  const { editMode } = useSiteContext()

  const lastPointer = useRef<[number, number]>([0, 0])

  const buildingDragHandler: Handler<"drag", ThreeEvent<PointerEvent>> = ({
    first,
    last,
  }) => {
    if (
      contextMode !== SiteContextModeEnum.Enum.SITE ||
      editMode !== EditModeEnum.Enum.MOVE_ROTATE
    ) {
      return
    }

    if (scope.selected?.buildingId !== buildingId) return

    if (first) {
      setCameraEnabled(false)
      lastPointer.current = pointer.xz
    }

    const [px0, pz0] = lastPointer.current
    const [px1, pz1] = pointer.xz

    const [dx, dz] = [px1 - px0, pz1 - pz0]

    houses[buildingId].position[0] += dx
    houses[buildingId].position[1] += dz

    console.log(houses[buildingId].position)

    invalidate()

    if (last) {
      setCameraEnabled(true)
      const [x, z] = houses[buildingId].position.map(snapToGrid) as [
        number,
        number
      ]
      houses[buildingId].position[0] = x
      houses[buildingId].position[1] = z
    }

    lastPointer.current = pointer.xz
  }

  return { buildingDragHandler }
}

export const useFocusedBuilding = () => {
  const houses = useHouses()
  const { buildingId } = useSiteContext()
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

export default houses
