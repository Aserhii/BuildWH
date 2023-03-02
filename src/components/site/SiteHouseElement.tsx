import { useBuildSystemsData } from "@/contexts/BuildSystemsData"
import { House } from "@/data/house"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import context from "@/stores/context"
import scope, {
  ElementScopeItem,
  LevelScopeItem,
  ModuleScopeItem,
  ScopeTypeEnum,
} from "@/stores/scope"
import { all, any, undef } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { flatten, getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap } from "fp-ts/lib/ReadonlyArray"
import React, { useEffect, useMemo, useRef } from "react"
import { BufferGeometry, Material, Mesh } from "three"
import { ref, subscribe } from "valtio"

const builtInMaterials: Record<string, Material> = {
  Glazing: glassMaterial,
}

type Props = MeshProps & {
  elementName: string
  rowIndex: number
  gridIndex: number
  house: House
  geometry: BufferGeometry
}

const HouseModuleElement = (props: Props) => {
  const { geometry, elementName, rowIndex, gridIndex, house } = props
  const meshRef = useRef<Mesh>()

  const { materials, elements } = useBuildSystemsData()

  const material = useMemo(() => {
    if (house.modifiedMaterials?.[elementName]) {
      return pipe(
        materials,
        findFirstMap((m) =>
          m.name === house.modifiedMaterials[elementName] && m.threeMaterial
            ? some(m.threeMaterial)
            : none
        ),
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        )
      )
    } else {
      return pipe(
        elements,
        findFirstMap((e) =>
          e.name === elementName
            ? some(
                pipe(
                  materials,
                  findFirstMap((m) =>
                    m.name === e.defaultMaterial && m.threeMaterial
                      ? some(m.threeMaterial)
                      : none
                  )
                )
              )
            : none
        ),
        flatten,
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        )
      )
    }
  }, [elementName, materials])

  useEffect(() =>
    subscribe(scope, () => {
      let isOutlined = context.outlined.includes(meshRef),
        isHovered = false,
        isSelected = false

      switch (scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          isHovered = scope.hovered === house.id
          isSelected = scope.selected.includes(house.id)
          break

        case ScopeTypeEnum.Enum.ELEMENT:
          isHovered =
            scope.hovered?.houseId === house.id &&
            scope.hovered.elementName === elementName
          isSelected = !undef(
            scope.selected.find(
              (x) => x.houseId === house.id && x.elementName === elementName
            )
          )
          break

        case ScopeTypeEnum.Enum.MODULE:
          isHovered =
            scope.hovered?.houseId === house.id &&
            scope.hovered.rowIndex === rowIndex &&
            scope.hovered.gridIndex === gridIndex
          isSelected = !undef(
            scope.selected.find(
              (x) =>
                x.houseId === house.id &&
                x.rowIndex === rowIndex &&
                x.gridIndex === gridIndex
            )
          )
          break

        case ScopeTypeEnum.Enum.LEVEL:
          isHovered =
            scope.hovered?.houseId === house.id &&
            scope.hovered.rowIndex === rowIndex
          isSelected = !undef(
            scope.selected.find(
              (x) => x.houseId === house.id && x.rowIndex === rowIndex
            )
          )
          break
      }

      if (context.menu === null && (isHovered || isSelected) && !isOutlined) {
        context.outlined.push(ref(meshRef)) // ref([...context.outlined, meshRef])
        invalidate()
      }
      if (all(context.menu === null, isOutlined, !isHovered, !isSelected)) {
        context.outlined = context.outlined.filter(
          (x) => x.current?.id !== meshRef.current?.id
        )
        invalidate()
      }
    })
  )

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
    onContextMenu: ThreeEvent<PointerEvent> &
      React.MouseEvent<EventTarget, MouseEvent>
  }>({
    onHover: ({ event: { intersections } }) => {
      if (context.menu) return
      if (undef(intersections[0])) return
      if (undef(meshRef.current)) return
      const obj = intersections[0].object ?? intersections[0].eventObject
      if (obj.id !== meshRef.current.id) return

      switch (scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          scope.hovered = house.id
          break
        case ScopeTypeEnum.Enum.ELEMENT:
          scope.hovered = { houseId: house.id, elementName }
          break
        case ScopeTypeEnum.Enum.MODULE:
          scope.hovered = {
            houseId: house.id,
            rowIndex,
            gridIndex: gridIndex,
          }
          break
        case ScopeTypeEnum.Enum.LEVEL:
          scope.hovered = { houseId: house.id, rowIndex }
          break
      }
    },
    onContextMenu: ({ event: { intersections, pageX, pageY } }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return
      switch (scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          if (!scope.selected.includes(house.id)) scope.selected.push(house.id)
          break
        case ScopeTypeEnum.Enum.LEVEL:
          if (scope.selected.filter((x) => x.houseId === house.id).length < 1)
            scope.selected.push({
              houseId: house.id,
              rowIndex,
            })
          break
        case ScopeTypeEnum.Enum.MODULE:
          if (scope.selected.filter((x) => x.houseId === house.id).length < 1)
            scope.selected.push({
              houseId: house.id,
              gridIndex,
              rowIndex,
            })
          break
        case ScopeTypeEnum.Enum.ELEMENT:
          if (scope.selected.filter((x) => x.houseId === house.id).length < 1)
            scope.selected.push({
              houseId: house.id,
              elementName,
            })
          break
      }
      context.menu = [pageX, pageY]
    },
    onPointerDown: ({ event: { intersections }, shiftKey }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return

      let isSelected = false
      let payload: any

      switch (scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          isSelected = scope.selected.includes(house.id)
          payload = house.id
          break
        case ScopeTypeEnum.Enum.MODULE:
          isSelected = !undef(
            scope.selected.find(
              (x) =>
                x.houseId === house.id &&
                x.rowIndex === rowIndex &&
                x.gridIndex === gridIndex
            )
          )
          payload = {
            houseId: house.id,
            rowIndex,
            gridIndex: gridIndex,
          } as ModuleScopeItem
          break
        case ScopeTypeEnum.Enum.ELEMENT:
          isSelected = !undef(
            scope.selected.find(
              (x) => x.houseId === house.id && x.elementName === elementName
            )
          )
          payload = { houseId: house.id, elementName } as ElementScopeItem
          break
        case ScopeTypeEnum.Enum.LEVEL:
          isSelected = !undef(
            scope.selected.find(
              (x) => x.houseId === house.id && x.rowIndex === rowIndex
            )
          )
          payload = { houseId: house.id, rowIndex } as LevelScopeItem
          break
      }

      if (!isSelected) {
        if (shiftKey) scope.selected.push(payload)
        else scope.selected = [payload]
      }
    },
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      {...(bind() as any)}
    />
  )
}

export default HouseModuleElement
