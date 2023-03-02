import { PositionedColumn, useColumnLayout } from "@/hooks/layouts"
import context, { useContext } from "@/stores/context"
import { outlineGroup } from "@/stores/highlights"
import { useHoverHouse, useUpdatePosition } from "@/stores/houses"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapRA } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useRef } from "react"
import { Group } from "three"
import { subscribe } from "valtio"
import BuildingBuilding from "./BuildingBuilding"
import BuildingHouseColumn from "./ColumnBuildingColumn"

type Props = {
  id: string
}

const SiteBuildingMain = (props: Props) => {
  const { id } = props
  const groupRef = useRef<Group>()

  useEffect(() => {
    scopes.secondary = {
      type: ScopeTypeEnum.Enum.ZERO,
      hovered: null,
      selected: [],
    }
  }, [])

  const hoverHouse = useHoverHouse(id)

  const onDrag = useUpdatePosition(id, groupRef)

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
  }>({
    onDrag,
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

  return (
    <group ref={groupRef} {...(bind() as any)}>
      {pipe(columns, mapRA(renderColumn))}
    </group>
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
