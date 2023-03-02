import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import houses, { useHouse, useResetHouse } from "@/stores/houses"
import scope, { ScopeTypeEnum } from "@/stores/scope"
import { Html } from "@react-three/drei"
import React, { Fragment, useState } from "react"
import RenameHouseForm from "./RenameHouseForm"

const HouseContextMenu = (props: ContextMenuProps) => {
  if (scope.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const houseId = scope.selected[0]

  const house = useHouse(houseId)

  const resetHouse = useResetHouse(houseId)

  const [renaming, setRenaming] = useState(false)

  const rename = () => setRenaming(true)

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>{house.friendlyName}</ContextMenuHeading>
      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetHouse}>Reset</ContextMenuButton>
          <ContextMenuButton onClick={resetHouse}>Delete</ContextMenuButton>
          <ContextMenuButton onClick={resetHouse}>
            Edit Building
          </ContextMenuButton>
        </Fragment>
      )}
      <ContextMenuButton onClick={rename}>Rename Building</ContextMenuButton>
      {renaming && (
        <RenameHouseForm
          {...props}
          currentName={house.friendlyName}
          onNewName={(newName) => {
            houses[houseId].friendlyName = newName
            setRenaming(false)
          }}
        />
      )}
    </ContextMenu>
  )
}

export default HouseContextMenu
