import { useSystemsData } from "@/contexts/SystemsData"
import context, { EditModeEnum, useContext } from "@/stores/context"
import houses, { useHouse } from "@/stores/houses"
import scopes, { HouseScope, ScopeTypeEnum } from "@/stores/scope"
import React, { Fragment, useState } from "react"
import ContextMenu, { ContextMenuProps } from "../ui/ContextMenu"
import ContextMenuButton from "../ui/ContextMenuButton"
import ContextMenuHeading from "../ui/ContextMenuHeading"
import BuildingContextMenu from "./BuildingContextMenu"
import RenameHouseForm from "./RenameHouseForm"

const SiteContextMenu_ = (props: ContextMenuProps) => {
  if (scopes.primary.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("SiteContextMenu called with scope type other than HOUSE")
    return null
  }

  const firstHouse = useHouse(scopes.primary.selected[0])
  const manySelected = scopes.primary.selected.length > 1
  const oneSelected = scopes.primary.selected.length === 1

  const { houseTypes } = useSystemsData()

  const resetBuildings = () => {
    for (let buildingId of (scopes.primary as HouseScope).selected) {
      const house = houses[buildingId]
      const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
      if (houseType) houses[buildingId].dna = houseType.dna as string[]
    }
    props.onClose?.()
  }

  const deleteBuildings = () => {
    for (let buildingId of (scopes.primary as HouseScope).selected) {
      delete houses[buildingId]
    }
    props.onClose?.()
  }

  // const deleteHouse = useDeleteHouse(buildingId)

  const [renaming, setRenaming] = useState(false)

  const rename = () => setRenaming(true)

  const editBuilding = () => {
    context.buildingId = firstHouse.id
    context.editMode = EditModeEnum.Enum.STRETCH
    props?.onClose?.()
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>
        {manySelected ? `Several Buildings` : firstHouse.friendlyName}
      </ContextMenuHeading>
      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetBuildings}>Reset</ContextMenuButton>
          <ContextMenuButton onClick={deleteBuildings}>
            Delete
          </ContextMenuButton>
          {oneSelected ? (
            <ContextMenuButton onClick={editBuilding}>
              Edit Building
            </ContextMenuButton>
          ) : null}
        </Fragment>
      )}

      {oneSelected ? (
        <Fragment>
          <ContextMenuButton onClick={rename}>
            Rename Building
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
      ) : null}
    </ContextMenu>
  )
}

const SiteContextMenu = () => {
  const {
    menu,
    buildingId,
    // scope: { type: scopeType },
  } = useContext()

  if (!menu) return null

  const [pageX, pageY] = menu

  const onClose = () => {
    // scopes.primary.selected = []
    context.menu = null
  }

  const props = { pageX, pageY, onClose }

  return !buildingId ? (
    <SiteContextMenu_ {...props} />
  ) : (
    <BuildingContextMenu {...props} buildingId={buildingId} />
  )
}

export default SiteContextMenu
