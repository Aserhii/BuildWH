import { LoadedModule } from "@/data/module"
import context, { useContext } from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapWithIndexM, StrOrd } from "@/utils"
import { GroupProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import React, { useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
import { subscribe } from "valtio"
import ColumnBuildingElement from "./ColumnBuildingElement"

type Props = GroupProps & {
  module: LoadedModule
  columnIndex: number
  levelIndex: number
  groupIndex: number
  buildingId: string
  levelY: number
  verticalCutPlanes: Plane[]
}

const ColumnBuildingModule = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    levelIndex,
    groupIndex,
    module,
    levelY,
    visible = true,
    verticalCutPlanes,
    ...groupProps
  } = props

  const groupRef = useRef<Group>()

  const moduleGeometries = useModuleGeometries(module.dna, module.gltf)

  const context = useContext()

  const levelCutPlane: Plane = useMemo(
    () => new Plane(new Vector3(0, -1, 0), levelY + module.height / 2),
    []
  )

  const children = pipe(
    moduleGeometries,
    mapWithIndexM((elementName, geometry) => (
      <ColumnBuildingElement
        key={elementName}
        {...{
          elementName,
          geometry,
          buildingId,
          columnIndex,
          levelIndex,
          groupIndex,
          clippingPlanes: [
            verticalCutPlanes,
            context.levelIndex === levelIndex ? [levelCutPlane] : [],
          ].flat(),
        }}
      />
    )),
    toArray(StrOrd)
  )

  const bind = useGesture<{ onPointerOver: ThreeEvent<PointerEvent> }>({
    onPointerMove: () => {
      if (context.menu !== null) return
      switch (true) {
        case scopes.secondary.type === ScopeTypeEnum.Enum.LEVEL &&
          scopes.secondary.hovered?.levelIndex !== levelIndex: {
          scopes.secondary.hovered = {
            levelIndex,
          }
        }
        case scopes.primary.type === ScopeTypeEnum.Enum.MODULE &&
          (scopes.primary.hovered?.columnIndex !== columnIndex ||
            scopes.primary.hovered?.levelIndex !== levelIndex ||
            scopes.primary.hovered?.groupIndex !== groupIndex):
          scopes.primary.hovered = {
            columnIndex,
            groupIndex,
            levelIndex,
          }
      }
    },
  })

  subscribe(scopes.primary, () => {
    if (
      scopes.primary.type === ScopeTypeEnum.Enum.MODULE &&
      scopes.primary.hovered?.columnIndex === columnIndex &&
      context.levelIndex === levelIndex
    ) {
      outlineGroup(groupRef)
    }
  })

  return (
    <group ref={groupRef} {...(bind() as any)} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
