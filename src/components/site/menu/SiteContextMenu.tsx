import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import { useSystemsData } from "@/contexts/SystemsData"
import siteContext, { EditModeEnum, useSiteContext } from "@/stores/context"
import houses, { useHouse } from "@/stores/houses"
import scope from "@/stores/scope"
import React, { Fragment, useState } from "react"
import BuildingContextMenu from "./BuildingContextMenu"
import LevelContextMenu from "./LevelContextMenu"
import RenameHouseForm from "./RenameHouseForm"

const SiteContextMenu_ = (props: ContextMenuProps) => {
  if (scope.selected === null) throw new Error("scope.selected null")

  const { buildingId } = scope.selected

  const firstHouse = useHouse(buildingId)

  const { houseTypes } = useSystemsData()

  const resetBuilding = () => {
    const house = houses[buildingId]
    const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
    if (houseType) {
      houses[buildingId].dna = houseType.dna as string[]
      houses[buildingId].modifiedMaterials = {}
      houses[buildingId].rotation = 0
    }
    props.onClose?.()
  }

  const deleteBuilding = () => {
    delete houses[buildingId]
    scope.selected = null
    if (Object.keys(houses).length === 0) {
      siteContext.editMode = null
      siteContext.buildingId = null
      siteContext.levelIndex = null
    }
    props.onClose?.()
  }

  const [renaming, setRenaming] = useState(false)

  const rename = () => setRenaming(true)

  const editBuilding = () => {
    siteContext.buildingId = firstHouse.id
    siteContext.editMode = EditModeEnum.Enum.STRETCH
    props?.onClose?.()
  }

  const moveRotate = () => {
    siteContext.editMode = EditModeEnum.Enum.MOVE_ROTATE
    props.onClose?.()
  }

  return (
    <ContextMenu {...props}>
      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetBuilding}>Reset</ContextMenuButton>
          <ContextMenuButton onClick={deleteBuilding}>Delete</ContextMenuButton>
          <ContextMenuButton onClick={editBuilding}>
            {`Edit building`}
          </ContextMenuButton>
          <ContextMenuButton onClick={moveRotate}>
            {`Move/rotate building`}
          </ContextMenuButton>
        </Fragment>
      )}

      <Fragment>
        <ContextMenuButton onClick={rename} className="focus:outline-none">
          {`Rename building`}
        </ContextMenuButton>
        {renaming && (
          <RenameHouseForm
            {...props}
            currentName={firstHouse.friendlyName}
            onNewName={(newName) => {
              houses[firstHouse.id].friendlyName = newName
              setRenaming(false)
            }}
          />
        )}
      </Fragment>

      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetBuilding}>
            {`Reset building`}
          </ContextMenuButton>
          <ContextMenuButton onClick={deleteBuilding}>
            {`Delete building`}
          </ContextMenuButton>
        </Fragment>
      )}
    </ContextMenu>
  )
}

const SiteContextMenu = () => {
  const { menu, buildingId, levelIndex } = useSiteContext()

  if (!menu) return null

  const [pageX, pageY] = menu

  const onClose = () => {
    // scope.selected = null
    siteContext.menu = null
  }

  const props = { pageX, pageY, onClose }

  return !buildingId ? (
    <SiteContextMenu_ {...props} />
  ) : levelIndex === null ? (
    <BuildingContextMenu {...props} />
  ) : (
    <LevelContextMenu {...props} />
  )
}

export default SiteContextMenu
