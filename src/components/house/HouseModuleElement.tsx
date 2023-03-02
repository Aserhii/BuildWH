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
import { useSystemsData } from "@/stores/systems"
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
  columnIndex: number
  rowIndex: number
  house: House
  geometry: BufferGeometry
}

const HouseModuleElement = (props: Props) => {
  const { geometry, elementName, columnIndex, rowIndex, house } = props
  const meshRef = useRef<Mesh>()

  const { materials, elements } = useSystemsData()

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

  // how are we going to do module index

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
            scope.hovered.columnIndex === columnIndex &&
            scope.hovered.rowIndex === rowIndex
          isSelected = !undef(
            scope.selected.find(
              (x) =>
                x.houseId === house.id &&
                x.columnIndex === columnIndex &&
                x.rowIndex === rowIndex
            )
          )
          break

        case ScopeTypeEnum.Enum.LEVEL:
          isHovered =
            scope.hovered?.houseId === house.id &&
            scope.hovered.columnIndex === columnIndex
          isSelected = !undef(
            scope.selected.find(
              (x) => x.houseId === house.id && x.columnIndex === columnIndex
            )
          )
          break
      }

      if ((isHovered || isSelected) && !isOutlined) {
        context.outlined = ref([...context.outlined, meshRef])
        invalidate()
      }
      if (all(isOutlined, !isHovered, !isSelected)) {
        context.outlined = ref(
          context.outlined.filter((x) => x.current?.id !== meshRef.current?.id)
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
          scope.hovered = { houseId: house.id, columnIndex, rowIndex }
          break
        case ScopeTypeEnum.Enum.LEVEL:
          scope.hovered = { houseId: house.id, columnIndex }
          break
      }
    },
    onContextMenu: ({ event: { intersections, pageX, pageY } }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return
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
                x.columnIndex === columnIndex &&
                x.rowIndex === rowIndex
            )
          )
          payload = {
            houseId: house.id,
            columnIndex,
            rowIndex,
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
              (x) => x.houseId === house.id && x.columnIndex === columnIndex
            )
          )
          payload = { houseId: house.id, columnIndex } as LevelScopeItem
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
