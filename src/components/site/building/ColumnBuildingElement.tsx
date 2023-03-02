import context from "@/stores/context"
import highlights, { setIlluminatedLevel } from "@/stores/highlights"
import { useMaterial, useMaterialName } from "@/stores/materials"
import scopes, { ScopeTypeEnum, select } from "@/stores/scope"
import { all, any, object3dChildOf, undef } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useEffect, useRef } from "react"
import { BufferGeometry, Mesh, Object3D, Plane } from "three"
import { ref, subscribe } from "valtio"

type Props = MeshProps & {
  elementName: string
  columnIndex: number
  levelIndex: number
  groupIndex: number
  buildingId: string
  geometry: BufferGeometry
  clippingPlanes: Plane[]
}

const ColumnBuildingElement = (props: Props) => {
  const {
    geometry,
    elementName,
    columnIndex,
    levelIndex,
    groupIndex,
    buildingId,
    clippingPlanes,
  } = props

  const meshRef = useRef<Mesh>()

  const materialName = useMaterialName(buildingId, elementName)

  const material = useMaterial(
    { buildingId, columnIndex, elementName, materialName, levelIndex },
    clippingPlanes
  )

  useEffect(() =>
    subscribe(scopes.primary, () => {
      if (scopes.primary.type !== ScopeTypeEnum.Enum.ELEMENT) return

      const isOutlined =
        highlights.outlined.filter((x) => x.id === meshRef.current!.id).length >
        0

      const isHovered =
        context.buildingId === buildingId &&
        scopes.primary.hovered?.elementName === elementName

      const isSelected = !undef(
        scopes.primary.selected.find((x) => x.elementName === elementName)
      )

      if ((isHovered || isSelected) && !isOutlined) {
        highlights.outlined.push(ref(meshRef.current as Object3D))
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
      }
    })
  )

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
    onPointerOver: ThreeEvent<PointerEvent>
    onContextMenu: ThreeEvent<PointerEvent> &
      React.MouseEvent<EventTarget, MouseEvent>
  }>({
    onHover: ({ event: { intersections } }) => {
      if (context.menu) return
      if (!intersections?.[0]) return
      if (!meshRef.current) return
      const obj = intersections[0].object ?? intersections[0].eventObject
      if (!object3dChildOf(obj, meshRef.current)) return
      switch (scopes.secondary.type) {
        case ScopeTypeEnum.Enum.LEVEL:
          if (scopes.secondary.hovered?.levelIndex === levelIndex) {
            scopes.secondary.hovered = { levelIndex }
            setIlluminatedLevel(buildingId, levelIndex)
          }
          break
      }

      switch (scopes.primary.type) {
        case ScopeTypeEnum.Enum.ELEMENT:
          scopes.primary.hovered = { elementName }
          break
      }
      invalidate()
    },
    onContextMenu: ({ event, event: { intersections, pageX, pageY } }) => {
      event.preventDefault?.()
      const obj = intersections[0].object ?? intersections[0].eventObject
      if (!meshRef.current) return

      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id,
        context.buildingId !== null && context.buildingId !== buildingId,
        !object3dChildOf(obj, meshRef.current)
      )
      if (returnIf) return

      select({
        buildingId: context.buildingId!,
        columnIndex,
        levelIndex: context.levelIndex ?? levelIndex,
        groupIndex,
        elementName,
      })
      context.menu = [pageX, pageY]
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

export default ColumnBuildingElement
