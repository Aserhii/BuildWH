import siteContext, {
  SiteContextModeEnum,
  useSiteContextMode,
} from "@/stores/context"
import highlights, { setIlluminatedLevel } from "@/stores/highlights"
import { useMaterial, useMaterialName } from "@/stores/materials"
import scope from "@/stores/scope"
import { all, any, objComp, object3dChildOf, undef } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useEffect, useRef } from "react"
import { BufferGeometry, Mesh, Object3D, Plane } from "three"
import { ref } from "valtio"
import { subscribeKey } from "valtio/utils"

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

  const contextMode = useSiteContextMode()

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
    onContextMenu: ThreeEvent<PointerEvent> &
      React.MouseEvent<EventTarget, MouseEvent>
  }>({
    onHover: ({ event: { intersections } }) => {
      if (!meshRef.current) return
      if (!intersections?.[0]) return
      const obj = intersections[0].object ?? intersections[0].eventObject
      if (!object3dChildOf(obj, meshRef.current)) return
      if (siteContext.menu !== null) return

      const key = {
        elementName,
        groupIndex,
        levelIndex,
        columnIndex,
        buildingId,
      }

      if (scope.hovered === null || !objComp(scope.hovered, key)) {
        scope.hovered = key
      }

      if (contextMode === SiteContextModeEnum.Enum.BUILDING) {
        setIlluminatedLevel(buildingId, levelIndex)
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
        siteContext.buildingId !== null &&
          siteContext.buildingId !== buildingId,
        !object3dChildOf(obj, meshRef.current)
      )
      if (returnIf) return

      scope.selected = {
        elementName,
        groupIndex,
        levelIndex,
        columnIndex,
        buildingId,
      }

      siteContext.menu = [pageX, pageY]
      invalidate()
    },
  })

  useEffect(() =>
    subscribeKey(scope, "hovered", () => {
      if (contextMode !== SiteContextModeEnum.Enum.BUILDING) return

      const isOutlined =
        highlights.outlined.filter(
          (x) => meshRef.current && x.id === meshRef.current.id
        ).length > 0

      const isHovered =
        buildingId === scope.hovered?.buildingId &&
        elementName === scope.hovered?.elementName

      const isSelected =
        scope.selected?.buildingId === buildingId &&
        scope.selected?.elementName === elementName

      if ((isHovered || isSelected) && !isOutlined) {
        highlights.outlined.push(ref(meshRef.current as Object3D))
      }
      if (
        all(
          siteContext.menu === null,
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
