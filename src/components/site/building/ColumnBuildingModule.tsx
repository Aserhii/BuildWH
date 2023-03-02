import { LoadedModule } from "@/data/module"
import {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup, setIlluminatedModule } from "@/stores/highlights"
import scope from "@/stores/scope"
import { mapWithIndexM, StrOrd } from "@/utils"
import { GroupProps } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import React, { useEffect, useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
import { subscribe } from "valtio"
import { subscribeKey } from "valtio/utils"
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

  const moduleGeometries = useModuleGeometries(
    module.systemId,
    module.dna,
    module.gltf
  )

  const context = useSiteContext()

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

  const contextMode = useSiteContextMode()

  useEffect(() => {
    if (contextMode === SiteContextModeEnum.Enum.LEVEL) {
      return subscribeKey(scope, "hovered", () => {
        if (
          context.menu === null &&
          scope.hovered?.columnIndex === columnIndex &&
          context.levelIndex === levelIndex
        ) {
          outlineGroup(groupRef)
        } else {
          outlineGroup(groupRef, { remove: true })
        }
      })
    }

    if (contextMode === SiteContextModeEnum.Enum.BUILDING) {
      return subscribe(scope, () => {
        if (
          context.menu === null &&
          ((scope.selected === null &&
            scope.hovered?.buildingId === buildingId &&
            scope.hovered.columnIndex === columnIndex &&
            scope.hovered.levelIndex === levelIndex &&
            scope.hovered.groupIndex === groupIndex) ||
            (scope.selected?.buildingId === buildingId &&
              scope.selected.columnIndex === columnIndex &&
              scope.selected.levelIndex === levelIndex &&
              scope.selected.groupIndex === groupIndex))
        ) {
          setIlluminatedModule({
            buildingId,
            columnIndex,
            levelIndex,
            groupIndex,
          })
        } else {
        }
      })
    }
  }, [contextMode])

  return (
    <group ref={groupRef} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
