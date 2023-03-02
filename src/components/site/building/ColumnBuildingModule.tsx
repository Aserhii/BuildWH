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

  subscribe(scopes.primary, () => {
    if (
      context.menu === null &&
      scopes.primary.type === ScopeTypeEnum.Enum.MODULE &&
      scopes.primary.hovered?.columnIndex === columnIndex &&
      context.levelIndex === levelIndex
    ) {
      outlineGroup(groupRef)
    } else {
      outlineGroup(groupRef, { remove: true })
    }
  })

  return (
    <group ref={groupRef} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
