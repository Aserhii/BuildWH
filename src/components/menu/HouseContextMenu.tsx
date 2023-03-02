import { ContextMenuProps } from "@/components/ui/ContextMenu"
import context from "@/stores/context"
import { useHouse } from "@/stores/houses"
import scopes from "@/stores/scope"
import scope, { ScopeTypeEnum } from "@/stores/scope"
import { useState } from "react"

const HouseContextMenu = (props: ContextMenuProps) => {
  const scope = scopes.primary
  if (scope.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const houseId = scope.selected[0]

  const house = useHouse(houseId)

  // const resetHouse = useResetBuildings(houseId)

  const [renaming, setRenaming] = useState(false)

  const rename = () => setRenaming(true)

  const editBuilding = () => {
    context.buildingId = houseId
    props?.onClose?.()
  }
}

export default HouseContextMenu
