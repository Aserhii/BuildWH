import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import { ScopeTypeEnum, store } from "@/store"
import { useResetHouse } from "@/store/actions"
import React from "react"

const HouseContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const houseId = store.scope.selected[0]

  const resetHouse = useResetHouse(houseId)

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>House</ContextMenuHeading>
      <ContextMenuButton onClick={resetHouse}>Reset</ContextMenuButton>
    </ContextMenu>
  )
}

export default HouseContextMenu
