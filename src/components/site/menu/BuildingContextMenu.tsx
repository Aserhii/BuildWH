import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { useColumnLayout } from "@/hooks/layouts"
import { useLevelInteractions } from "@/hooks/levels"
import { useWindowOptions, WindowOpt } from "@/hooks/modules"
import siteContext, {
  SiteContextModeEnum,
  useSiteContextMode,
} from "@/stores/context"
import houses from "@/stores/houses"
import scope from "@/stores/scope"
import React from "react"
import ChangeMaterials from "./ChangeMaterials"

const BuildingContextMenu = (props: ContextMenuProps) => {
  if (scope.selected === null) throw new Error("scope.selected null")

  const { elementName, groupIndex, levelIndex, columnIndex, buildingId } =
    scope.selected

  const columnLayout = useColumnLayout(buildingId)

  const editLevel = () => {
    siteContext.levelIndex = levelIndex
    props.onClose?.()
  }

  const { addFloorAbove, removeFloor, canAddFloorAbove, canRemoveFloor } =
    useLevelInteractions(buildingId, levelIndex, props.onClose)

  const { options: windowOpts, selected: selectedWindowOpt } = useWindowOptions(
    columnLayout,
    {
      columnIndex,
      levelIndex,
      groupIndex,
    }
  )

  const canChangeWindow = windowOpts.length > 1

  const changeWindow = ({ buildingDna }: WindowOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  return (
    <ContextMenu {...props}>
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
      {elementName && (
        <ChangeMaterials
          buildingId={buildingId}
          elementName={elementName}
          onComplete={props.onClose}
        />
      )}
      {canChangeWindow && (
        <ContextMenuNested long label="Change window">
          <Radio
            options={windowOpts}
            selected={selectedWindowOpt}
            onChange={changeWindow}
          />
        </ContextMenuNested>
      )}
    </ContextMenu>
  )
}

export default BuildingContextMenu
