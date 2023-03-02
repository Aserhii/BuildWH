import RotateHandles from "@/components/ui-3d/RotateHandles"
import { PositionedColumn, useColumnLayout } from "@/hooks/layouts"
import { setCameraEnabled } from "@/stores/camera"
import context, { EditModeEnum, useContext } from "@/stores/context"
import debug from "@/stores/debug"
import { outlineGroup } from "@/stores/highlights"
import houses, { useHoverHouse } from "@/stores/houses"
import pointer from "@/stores/pointer"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapRA, snapToGrid } from "@/utils"
import { invalidate, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { Fragment, useCallback, useEffect, useRef } from "react"
import { Group } from "three"
import { subscribe } from "valtio"
import { subscribeKey } from "valtio/utils"
import PlanesDebug from "../../debug/PlanesDebug"
import BuildingBuilding from "./BuildingBuilding"
import BuildingHouseColumn from "./ColumnBuildingColumn"

type Props = {
  id: string
}

const SiteBuildingMain = (props: Props) => {
  const { id } = props
  const groupRef = useRef<Group>()

  const { editMode } = useContext()

  useEffect(() => {
    scopes.secondary = {
      type: ScopeTypeEnum.Enum.ZERO,
      hovered: null,
      selected: [],
    }
  }, [])

  const hoverHouse = useHoverHouse(id)

  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = houses[id].position
    groupRef.current.position.set(x, 0, z)
  }, [id])

  useEffect(
    () => subscribe(houses[id].position, onPositionUpdate),
    [id, onPositionUpdate]
  )

  useEffect(onPositionUpdate, [onPositionUpdate])

  useEffect(() => {
    const go = () => {
      if (!groupRef.current) return
      groupRef.current?.rotation.set(0, houses[id].rotation, 0)
    }
    go()
    return subscribeKey(houses[id], "rotation", go)
  }, [])

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
  }>({
    onDrag: ({ first, last }) => {
      if (
        scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE ||
        context.editMode !== EditModeEnum.Enum.MOVE_ROTATE
      )
        return
      if (first) {
        setCameraEnabled(false)
      }

      const [px, pz] = pointer.xz
      const [x, z] = houses[id].position
      const [dx, dz] = [px - x, pz - z].map(snapToGrid)

      for (let k of scopes.primary.selected) {
        houses[k].position[0] += dx
        houses[k].position[1] += dz
      }

      invalidate()

      if (last) setCameraEnabled(true)
    },
    onPointerOver: () => {
      if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) return
      hoverHouse()
    },
    onPointerOut: () => {
      if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) return
      hoverHouse(false)
    },
    onContextMenu: ({ event, event: { pageX, pageY, shiftKey } }) => {
      event.preventDefault?.()
      if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) return
      if (!scopes.primary.selected.includes(id)) {
        if (!shiftKey) {
          scopes.primary.selected = [id]
        } else {
          scopes.primary.selected.push(id)
        }
      }
      context.menu = [pageX, pageY]
    },
    onPointerDown: ({ shiftKey }) => {
      if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) return
      if (!scopes.primary.selected.includes(id)) {
        if (!shiftKey) {
          scopes.primary.selected = [id]
        } else {
          scopes.primary.selected.push(id)
        }
      }
    },
  })

  subscribe(scopes.primary, () => {
    if (scopes.primary.type === ScopeTypeEnum.Enum.HOUSE) {
      outlineGroup(groupRef, {
        remove:
          scopes.primary.hovered !== id &&
          !scopes.primary.selected.includes(id),
      })
    }
  })

  const columns = useColumnLayout(id)

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <BuildingHouseColumn
      key={columnIndex}
      buildingId={id}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columns.length - 1}
    />
  )

  const buildingLength = columns.reduce((acc, v) => acc + v.length, 0)
  const buildingWidth = columns[0].gridGroups[0].modules[0].module.width

  return (
    <Fragment>
      <group ref={groupRef} {...(bind() as any)}>
        {pipe(columns, mapRA(renderColumn))}
        {editMode === EditModeEnum.Enum.MOVE_ROTATE && (
          <RotateHandles
            buildingId={id}
            buildingLength={buildingLength}
            buildingWidth={buildingWidth}
          />
        )}
      </group>
    </Fragment>
  )
}

const SiteBuilding = ({ id }: Props) => {
  const { buildingId } = useContext()

  return buildingId !== id ? (
    <SiteBuildingMain id={id} />
  ) : (
    <BuildingBuilding id={id} />
  )
}

export default SiteBuilding
