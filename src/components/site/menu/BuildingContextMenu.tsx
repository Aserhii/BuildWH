import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { House } from "@/data/house"
import {
  LevelTypeOpt,
  useLevelInteractions,
  useLevelTypeOptions,
} from "@/hooks/interactions/levels"
import { useWindowOptions, WindowOpt } from "@/hooks/interactions/windows"
import { useColumnLayout } from "@/hooks/layouts"
import siteContext from "@/stores/context"
import houses, { useHouse } from "@/stores/houses"
import scope from "@/stores/scope"
import React from "react"
import ChangeMaterials from "./ChangeMaterials"

const BuildingContextMenu = (props: ContextMenuProps) => {
  const { selected } = props

  const { elementName, groupIndex, levelIndex, columnIndex, buildingId } =
    selected

  const house = useHouse(buildingId) as House

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

  const windowTypeCount = windowOpts.reduce(
    (acc, { value: { windowType } }) =>
      acc + Number(windowType.match(/[a-zA-Z]+|[0-9]+/g)?.[1]) ?? 0,
    0
  )

  const canChangeWindow = windowOpts.length > 1 && windowTypeCount > 0

  const changeWindow = ({ buildingDna }: WindowOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  const {
    options: levelTypeOptions,
    selected: selectedLevelType,
    levelString,
  } = useLevelTypeOptions(buildingId, columnLayout, {
    columnIndex,
    levelIndex,
    groupIndex,
  })

  const canChangeLevelType = levelTypeOptions.length > 1

  const changeLevelType = ({ buildingDna }: LevelTypeOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>{house.friendlyName}</ContextMenuHeading>
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
      {canChangeLevelType && (
        <ContextMenuNested long label={`Change ${levelString} type`}>
          <Radio
            options={levelTypeOptions}
            selected={selectedLevelType}
            onChange={changeLevelType}
          />
        </ContextMenuNested>
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
