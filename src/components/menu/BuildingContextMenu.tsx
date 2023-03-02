import { useContext } from "@/stores/context"
import { ElementScope } from "@/stores/scope"
import React from "react"
import ContextMenu, { ContextMenuProps } from "../ui/ContextMenu"
import ContextMenuHeading from "../ui/ContextMenuHeading"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  const { scopes } = useContext()
  if (scopes.primary.selected.length !== 1) return null
  const elementName = (scopes.primary as ElementScope).selected[0].elementName
  return (
    <ContextMenu {...restProps}>
      <ContextMenuHeading>{elementName}</ContextMenuHeading>
    </ContextMenu>
  )
}

export default BuildingContextMenu
