import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import { useLevelInteractions } from "@/hooks/levels"
import context from "@/stores/context"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import React from "react"
import { useSnapshot } from "valtio"
import ChangeMaterials from "./ChangeMaterials"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  const { primary, secondary } = useSnapshot(scopes)
  if (
    primary.type !== ScopeTypeEnum.Enum.ELEMENT ||
    secondary.type !== ScopeTypeEnum.Enum.LEVEL
  )
    throw new Error("Unexpected scopes in BuildingContextMenu")

  if (primary.selected.length > 1 || secondary.selected.length > 1)
    throw new Error("Multi-select not yet supported in building context")

  const elementName = primary.selected[0].elementName
  const levelIndex = secondary.selected[0].levelIndex

  const editLevel = () => {
    context.levelIndex = levelIndex
    props.onClose?.()
  }

  const { addFloorAbove, removeFloor, canAddFloorAbove, canRemoveFloor } =
    useLevelInteractions(buildingId, levelIndex, props.onClose)

  return (
    <ContextMenu {...restProps}>
      <ContextMenuButton onClick={editLevel}>{`Edit level`}</ContextMenuButton>
      {canAddFloorAbove && (
        <ContextMenuButton
          onClick={addFloorAbove}
        >{`Add floor above`}</ContextMenuButton>
      )}
      {canRemoveFloor && (
        <ContextMenuButton
          onClick={removeFloor}
        >{`Remove floor`}</ContextMenuButton>
      )}
      <ChangeMaterials buildingId={buildingId} elementName={elementName} />
    </ContextMenu>
  )
}

export default BuildingContextMenu
