import { LoadedModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import { setCameraEnabled } from "@/stores/camera"
import siteContext, {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import events from "@/stores/events"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import menu from "@/stores/menu"
import pointer from "@/stores/pointer"
import scope, { isSelected } from "@/stores/scope"
import { reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, ThreeEvent } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
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
  columnZ: number
}

const ColumnBuildingModule = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    levelIndex,
    groupIndex,
    module,
    levelY,
    verticalCutPlanes,
    columnZ,
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
    reduceWithIndexM(StrOrd)(
      [],
      (elementName, acc: JSX.Element[], geometry) => [
        ...acc,
        <ColumnBuildingElement
          key={elementName}
          {...{
            elementName,
            geometry,
            systemId: module.systemId,
            buildingId,
            columnIndex,
            levelIndex,
            groupIndex,
            clippingPlanes: [
              verticalCutPlanes,
              context.levelIndex === levelIndex ? [levelCutPlane] : [],
            ].flat(),
          }}
        />,
      ]
    )
  )

  const contextMode = useSiteContextMode()

  useEffect(() => {
    if (contextMode === SiteContextModeEnum.Enum.LEVEL) {
      return subscribeKey(scope, "hovered", () => {
        if (
          !menu.open &&
          scope.hovered?.columnIndex === columnIndex &&
          context.levelIndex === levelIndex
        ) {
          outlineGroup(groupRef)
        } else {
          outlineGroup(groupRef, { remove: true })
        }
      })
    }
  }, [contextMode])

  const rotateVector = useRotateVector(buildingId)
  const initXZ = useRef([0, 0])

  const dragModuleShifted = useRef<"UP" | "DOWN" | null>(null)

  useEffect(
    () =>
      subscribeKey(events, "dragModule", () => {
        if (
          scope.selected === null ||
          scope.selected.buildingId !== buildingId ||
          scope.selected.levelIndex !== levelIndex ||
          scope.selected.columnIndex === columnIndex ||
          module.structuredDna.positionType === "END" ||
          !groupRef.current
        )
          return

        if (events.dragModule === null) {
          if (dragModuleShifted.current !== null) {
            dragModuleShifted.current = null
            groupRef.current.position.x = 0
            groupRef.current.position.z = 0
          }
          return
        }

        const { z0, z, length } = events.dragModule

        const [dx, dz] = rotateVector([0, length])

        switch (true) {
          case dragModuleShifted.current !== "DOWN" &&
            z0 < columnZ &&
            z > columnZ:
            dragModuleShifted.current = "DOWN"
            groupRef.current.position.x = -dx
            groupRef.current.position.z = -dz
            break

          case dragModuleShifted.current !== "UP" &&
            z0 > columnZ &&
            z < columnZ:
            dragModuleShifted.current = "UP"
            groupRef.current.position.x = dx
            groupRef.current.position.z = dz
            break

          case dragModuleShifted.current !== null &&
            ((z0 < columnZ && z < columnZ) || (z0 > columnZ && z > columnZ)):
            dragModuleShifted.current = null
            groupRef.current.position.x = 0
            groupRef.current.position.z = 0
            break
        }
      }),
    []
  )

  const bind = useDrag<ThreeEvent<PointerEvent>>(({ first, last }) => {
    if (first) setCameraEnabled(false)
    if (last) setCameraEnabled(true)

    if (
      scope.selected === null ||
      siteContext.levelIndex === null ||
      siteContext.levelIndex !== scope.selected.levelIndex ||
      !groupRef.current ||
      module.structuredDna.positionType === "END"
    ) {
      return
    }

    const [px, pz] = pointer.xz
    initXZ.current = [px, pz]

    if (first) {
      scope.locked = true
    }

    if (
      !isSelected({
        buildingId,
        columnIndex,
        levelIndex: siteContext.levelIndex,
        groupIndex,
      })
    ) {
      return
    }

    const [x0, z0] = initXZ.current

    const [dx, dz] = rotateVector([0, pz - z0])

    groupRef.current.position.x = dx
    groupRef.current.position.z = dz

    events.dragModule = {
      z: columnZ + dz,
      z0: columnZ,
      length: module.length,
    }

    if (last) {
      events.dragModule = null
      scope.locked = false
      groupRef.current.position.x = 0
      groupRef.current.position.z = 0
    }
  })

  return (
    <group ref={groupRef as any} {...(bind() as any)} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
