import { useSystemsData } from "@/contexts/SystemsData"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import invisibleMaterial from "@/materials/invisibleMaterial"
import context from "@/stores/context"
import highlights from "@/stores/highlights"
import { useHouse } from "@/stores/houses"
import scopes, { ElementScopeItem, ScopeTypeEnum } from "@/stores/scope"
import { all, any, ObjectRef, undef } from "@/utils"
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
  levelIndex: number
  groupIndex: number
  buildingId: string
  geometry: BufferGeometry
  visible: boolean
}

const ColumnBuildingElement = (props: Props) => {
  const {
    geometry,
    elementName,
    levelIndex,
    groupIndex,
    columnIndex,
    buildingId,
    visible,
  } = props
  const house = useHouse(buildingId)

  const meshRef = useRef<Mesh>()

  const { materials, elements } = useSystemsData()

  const material = useMemo(() => {
    if (!visible) return invisibleMaterial
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
  }, [elementName, materials, visible])

  useEffect(() =>
    subscribe(scopes.primary, () => {
      let isOutlined =
          highlights.outlined.filter(
            (x) => x.current.id === meshRef.current!.id
          ).length > 0,
        isHovered = false,
        isSelected = false
      switch (scopes.primary.type) {
        // case ScopeTypeEnum.Enum.HOUSE:
        //   isHovered = scopes.primary.hovered === house.id
        //   isSelected = scopes.primary.selected.includes(house.id)
        //   break

        case ScopeTypeEnum.Enum.ELEMENT:
          isHovered =
            context.buildingId === buildingId &&
            scopes.primary.hovered?.elementName === elementName
          isSelected = !undef(
            scopes.primary.selected.find((x) => x.elementName === elementName)
          )
          break

        // case ScopeTypeEnum.Enum.MODULE:
        //   isHovered =
        //     scopes.primary.hovered?.columnIndex === columnIndex &&
        //     scopes.primary.hovered?.levelIndex === levelIndex &&
        //     scopes.primary.hovered?.groupIndex === groupIndex
        //   isSelected = !undef(
        //     scopes.primary.selected.find(
        //       (x) =>
        //         x.columnIndex === columnIndex &&
        //         x.levelIndex === levelIndex &&
        //         x.groupIndex === groupIndex
        //     )
        //   )
        //   break

        // case ScopeTypeEnum.Enum.LEVEL:
        //   isHovered =
        //     scopes.primary.hovered?.houseId === house.id &&
        //     scopes.primary.hovered.rowIndex === levelIndex
        //   isSelected = !undef(
        //     scopes.primary.selected.find(
        //       (x) => x.houseId === house.id && x.rowIndex === levelIndex
        //     )
        //   )
        //   break
      }

      if ((isHovered || isSelected) && !isOutlined) {
        console.log("outlining")
        highlights.outlined.push(ref(meshRef as ObjectRef))
        invalidate()
        // outlineMesh(meshRef)
      }
      if (
        all(
          context.menu === null,
          isOutlined,
          !isHovered,
          !isSelected,
          !!meshRef.current
        )
      ) {
        highlights.outlined = highlights.outlined.filter(
          (x) => x.current.id !== meshRef.current!.id
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

      switch (scopes.primary.type) {
        // case ScopeTypeEnum.Enum.HOUSE:
        //   scopes.primary.hovered = house.id
        //   break
        case ScopeTypeEnum.Enum.ELEMENT:
          scopes.primary.hovered = { elementName }
          break
        // case ScopeTypeEnum.Enum.MODULE:
        //   scopes.primary.hovered = {
        //     columnIndex,
        //     levelIndex,
        //     groupIndex,
        //   }
        //   break
        // case ScopeTypeEnum.Enum.LEVEL:
        //   scopes.primary.hovered = { houseId: house.id, rowIndex: levelIndex }
        //   break
      }
    },
    onContextMenu: ({ event: { intersections, pageX, pageY } }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return
      switch (scopes.primary.type) {
        case ScopeTypeEnum.Enum.ELEMENT:
          if (
            scopes.primary.selected.filter((x) => x.elementName === elementName)
              .length < 1
          )
            scopes.primary.selected.push({
              elementName,
            })
          break
        // case ScopeTypeEnum.Enum.HOUSE:
        //   if (!scopes.primary.selected.includes(house.id)) scopes.primary.selected.push(house.id)
        //   break
        // case ScopeTypeEnum.Enum.LEVEL:
        //   if (scopes.primary.selected.filter((x) => x.houseId === house.id).length < 1)
        //     scopes.primary.selected.push({
        //       houseId: house.id,
        //       rowIndex: levelIndex,
        //     })
        //   break
        // case ScopeTypeEnum.Enum.MODULE:
        //   if (scopes.primary.selected.filter((x) => x.houseId === house.id).length < 1)
        //     scopes.primary.selected.push({
        //       houseId: house.id,
        //       gridIndex: groupIndex,
        //       rowIndex: levelIndex,
        //     })
        //   break
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

      switch (scopes.primary.type) {
      }
      // case ScopeTypeEnum.Enum.HOUSE:
      //   isSelected = scopes.primary.selected.includes(house.id)
      //   payload = house.id
      //   break
      // case ScopeTypeEnum.Enum.MODULE:
      //   isSelected = !undef(
      //     scopes.primary.selected.find(
      //       (x) =>
      //         x.houseId === house.id &&
      //         x.rowIndex === levelIndex &&
      //         x.gridIndex === groupIndex
      //     )
      //   )
      //   payload = {
      //     houseId: house.id,
      //     rowIndex: levelIndex,
      //     gridIndex: groupIndex,
      //   } as ModuleScopeItem
      //   break

      // case ScopeTypeEnum.Enum.ELEMENT:
      //   isSelected = !undef(
      //     scopes.primary.selected.find((x) => x.elementName === elementName)
      //   )
      //   payload = { houseId: house.id, elementName } as ElementScopeItem
      //   break

      // case ScopeTypeEnum.Enum.LEVEL:
      //   isSelected = !undef(
      //     scopes.primary.selected.find(
      //       (x) => x.houseId === house.id && x.rowIndex === levelIndex
      //     )
      //   )
      //   payload = {
      //     houseId: house.id,
      //     rowIndex: levelIndex,
      //   } as LevelScopeItem
      //   break

      // if (!isSelected) {
      //   if (shiftKey) scopes.primary.selected.push(payload)
      //   else scopes.primary.selected = [payload]
      // }
    },
  })

  // useEffect(
  //   () => () => {
  //     context.outlined = context.outlined.filter(
  //       (o) => o.current?.id !== meshRef.current?.id
  //     )
  //   },
  //   []
  // )

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      {...(bind() as any)}
    />
  )
}

export default ColumnBuildingElement
