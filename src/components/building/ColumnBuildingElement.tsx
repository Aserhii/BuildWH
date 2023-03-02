import useMaterial from "@/hooks/useMaterial"
import context from "@/stores/context"
import highlights, { setIlluminatedLevel } from "@/stores/highlights"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { all, any, undef } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useEffect, useRef } from "react"
import { BufferGeometry, Mesh, Object3D } from "three"
import { ref, subscribe } from "valtio"

type Props = MeshProps & {
  elementName: string
  columnIndex: number
  levelIndex: number
  groupIndex: number
  buildingId: string
  geometry: BufferGeometry
  visible: boolean
  moduleHeight: number
}

const ColumnBuildingElement = (props: Props) => {
  const {
    geometry,
    elementName,
    columnIndex,
    levelIndex,
    groupIndex,
    buildingId,
    visible,
    moduleHeight,
  } = props

  const meshRef = useRef<Mesh>()

  const material = useMaterial(
    { buildingId, elementName, levelIndex },
    moduleHeight,
    visible
  )

  useEffect(() =>
    subscribe(scopes.primary, () => {
      let isOutlined =
          highlights.outlined.filter((x) => x.id === meshRef.current!.id)
            .length > 0,
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
        highlights.outlined.push(ref(meshRef.current as Object3D))
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
          (x) => x.id !== meshRef.current!.id
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

      switch (scopes.secondary.type) {
        case ScopeTypeEnum.Enum.LEVEL:
          if (scopes.secondary.hovered?.levelIndex === levelIndex) {
            setIlluminatedLevel(buildingId, levelIndex)
            // invalidate()
          }
          // if (highlights.hoveredLevelIndex !== levelIndex) {
          //   highlights.hoveredLevelIndex = levelIndex
          // }
          break
          // const m = materials[buildingId][elementName][levelIndex]
          // m.material.opacity = 1.0

          // for (let [elName, obj] of Object.entries(materials[buildingId])) {
          //   for (let level of Object.keys(obj)) {
          //     if (Number(level) === levelIndex) break
          //     materials[buildingId][elName][
          //       Number(level)
          //     ].material.opacity = 0.1
          //   }
          // }
          // invalidate()
          // if (!m.illuminated) m.illuminated = true
          break

        // else {
        //   if ("color" in m.material) {
        //     // @ts-ignore
        //     m.material.color = m.material.color.add(new Color("#660000"))
        //     m.illuminated = true
        //     invalidate()
        //   }
        //   for (let k of Object.keys(materials[buildingId][elementName])) {
        //     if (Number(k) === levelIndex) break
        //     const n = materials[buildingId][elementName][Number(k)]
        //     if (n.illuminated && "color" in m.material) {
        //       // @ts-ignore
        //       n.material.color = m.material.color.sub(new Color("#660000"))
        //       n.illuminated = false
        //       invalidate()
        //     }
        //   }
        // }
      }

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
