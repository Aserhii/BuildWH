import { useSystemsData } from "@/contexts/SystemsData"
import { LoadedModule } from "@/data/module"
import context from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { fuzzyMatch, isMesh, mapM, mapWithIndexM, StrOrd } from "@/utils"
import { GroupProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import { map as mapA, reduce } from "fp-ts/lib/ReadonlyArray"
import {
  filter,
  map,
  mapWithIndex,
  toReadonlyArray,
} from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import React, { useRef } from "react"
import { BufferGeometry, Group, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import { subscribe } from "valtio"
import ColumnBuildingElement from "./ColumnBuildingElement"

type Props = GroupProps & {
  module: LoadedModule
  columnIndex: number
  levelIndex: number
  groupIndex: number
  buildingId: string
  levelY: number
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
    ...groupProps
  } = props

  const groupRef = useRef<Group>()

  const { elements } = useSystemsData()
  const moduleGeometries = useModuleGeometries(module.dna, module.gltf)

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
          clippingPlaneHeight: levelY + module.height / 2,
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
