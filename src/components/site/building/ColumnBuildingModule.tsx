import { BareModule, LoadedModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import { columnMatrixToDna } from "@/hooks/layouts"
import { setCameraEnabled } from "@/stores/camera"
import siteContext, {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import houses from "@/stores/houses"
import swap from "@/stores/interactions/swap"
import menu from "@/stores/menu"
import pointer from "@/stores/pointer"
import scope from "@/stores/scope"
import { reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, invalidate } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { and, not, or, Predicate } from "fp-ts/lib/Predicate"
import produce from "immer"
import { useEffect, useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
import { subscribeKey } from "valtio/utils"
import ColumnBuildingElement from "./ColumnBuildingElement"

const TGT = "W1-MID-G1-GRID2-19-ST0-L0-SIDE0-SIDE0-END0-TOP0"

const isTgt = (moduleDna: string): boolean => moduleDna === TGT

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

  const { position, scale } = groupProps

  const [positionX0, positionZ0] =
    position instanceof Vector3
      ? [position.x, position.z]
      : typeof position === "object"
      ? [position[0], position[1]]
      : [0, 0]

  const [x0, z0] = [positionX0, columnZ + positionZ0 + module.length / 2]

  const groupRef = useRef<Group>()

  useEffect(() => {
    if (isTgt(module.dna))
      console.log({
        groupPos: JSON.stringify(groupRef.current?.position),
        pos: JSON.stringify(position),
      })
  }, [positionX0])

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
          key={`${buildingId}-${columnIndex}-${levelIndex}-${groupIndex}-${elementName}`}
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
          context.levelIndex === levelIndex &&
          scope.hovered.groupIndex === groupIndex
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

  const isSelected = pipe(
    () => scope.selected?.buildingId === buildingId,
    and(() => scope.selected?.columnIndex === columnIndex),
    and(() => scope.selected?.levelIndex === levelIndex),
    and(() => scope.selected?.groupIndex === groupIndex)
  )

  const isDragResponsive: Predicate<void> = pipe(
    () => scope.selected === null,
    or(() => scope.selected?.buildingId !== buildingId),
    or(() => scope.selected?.levelIndex === levelIndex),
    or(isSelected),
    or(() => module.structuredDna.positionType === "END"),
    not
  )

  useEffect(
    () =>
      subscribeKey(swap, "dragModule", () => {
        if (!isDragResponsive() || !groupRef.current) return

        const { dragModule } = swap

        // and if this module is the responder?
        // just comment this for now
        //
        if (dragModule === null) {
          console.log(`dragModule null, returning early`)
          // swap.dragModuleShifted = null
          // groupRef.current.position.x = positionX0
          // groupRef.current.position.z = positionZ0
          return
        }

        const [dx, dz] = rotateVector([0, dragModule.length])

        const thisLow = z0,
          thisHigh = z0 + module.length,
          current = dragModule.z0 + dragModule.length / 2 + dragModule.dz,
          isHigherModule = z0 > dragModule.z0,
          isLowerModule = !isHigherModule

        const dragThreshold = Math.min(dragModule.length, module.length)

        if (isHigherModule) {
          if (
            current + dragThreshold > thisHigh &&
            swap.dragModuleShifted !== "DOWN"
          ) {
            groupRef.current.position.x = -dx
            groupRef.current.position.z = -dz
            swap.dragModuleShifted = "DOWN"
            console.log("down")
            swap.dragModuleResponder = {
              columnIndex,
              levelIndex,
              groupIndex,
            }
          } else if (
            current + dragThreshold < thisHigh &&
            swap.dragModuleShifted !== null &&
            swap.dragModuleResponder?.columnIndex === columnIndex &&
            swap.dragModuleResponder.groupIndex === groupIndex
          ) {
            groupRef.current.position.x = positionX0
            groupRef.current.position.z = positionZ0
            swap.dragModuleShifted = null
            console.log("nulling not down")
            swap.dragModuleResponder = {
              columnIndex,
              levelIndex,
              groupIndex,
            }
          }
        } else if (isLowerModule) {
          if (
            current - dragThreshold < thisLow &&
            swap.dragModuleShifted !== "UP"
          ) {
            groupRef.current.position.x = dx
            groupRef.current.position.z = dz
            swap.dragModuleShifted = "UP"
            console.log("up")
            swap.dragModuleResponder = {
              columnIndex,
              levelIndex,
              groupIndex,
            }
          } else if (
            current - dragThreshold > thisLow &&
            swap.dragModuleShifted !== null &&
            swap.dragModuleResponder?.columnIndex === columnIndex &&
            swap.dragModuleResponder.groupIndex === groupIndex
          ) {
            groupRef.current.position.x = positionX0
            groupRef.current.position.z = positionZ0
            swap.dragModuleShifted = null
            console.log("null 2")
            swap.dragModuleResponder = {
              columnIndex,
              levelIndex,
              groupIndex,
            }
          }
        }

        invalidate()
      }),
    []
  )

  const dragModuleXZ0 = useRef([0, 0])

  const bind = useDrag(({ first, last }) => {
    const [px, pz] = pointer.xz

    // might need to check intersections?

    if (
      siteContext.levelIndex === null ||
      !groupRef.current ||
      module.structuredDna.positionType === "END" ||
      !(
        levelIndex === siteContext.levelIndex &&
        groupIndex === scope.selected?.groupIndex
      )
    ) {
      console.log("im doing a return")
      return
    }

    if (first) {
      setCameraEnabled(false)
      scope.locked = true
      initXZ.current = [px, pz]
      dragModuleXZ0.current = [
        groupRef.current?.position.x ?? 0,
        groupRef.current?.position.z ?? 0,
      ]
    }

    if (last) {
      setCameraEnabled(true)
      scope.locked = false
    }

    const [, initZ] = initXZ.current
    const [dragModuleX0, dragModuleZ0] = dragModuleXZ0.current

    const [dx, dz] = rotateVector([0, pz - initZ])

    groupRef.current.position.x = dragModuleX0 + dx
    groupRef.current.position.z = dragModuleZ0 + dz

    swap.dragModule = {
      dz,
      z0,
      length: module.length,
    }

    if (last) {
      if (
        swap.activeBuildingMatrix === null ||
        swap.dragModuleResponder === null ||
        levelIndex !== siteContext.levelIndex
      )
        return

      const {
        columnIndex: c,
        levelIndex: l,
        groupIndex: g,
      } = swap.dragModuleResponder

      if (c === columnIndex && l === levelIndex && g === groupIndex) return

      console.log("at least here")

      console.log(swap.dragModuleShifted)

      if (swap.dragModuleShifted !== null) {
        console.log(`changing the DNA`)
        houses[buildingId].dna = pipe(
          swap.activeBuildingMatrix,
          produce<BareModule[][][]>((draft) => {
            const tmp = { ...draft[columnIndex][levelIndex][groupIndex] }
            draft[columnIndex][levelIndex][groupIndex] = { ...draft[c][l][g] }
            draft[c][l][g] = { ...tmp }
          }),
          (x) => {
            swap.activeBuildingMatrix = x
            return x
          },
          columnMatrixToDna
        )
      }

      swap.dragModule = null
      swap.dragModuleResponder = null

      groupRef.current.position.x = positionX0
      groupRef.current.position.z = positionZ0

      invalidate()
    }
  })

  return (
    <group ref={groupRef as any} {...(bind() as any)} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
