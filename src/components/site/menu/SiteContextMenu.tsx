import context, { useContext } from "@/stores/context"
import { ScopeTypeEnum } from "@/stores/scope"
import React from "react"
import HouseContextMenu from "./HouseContextMenu"
import LevelContextMenu from "./LevelContextMenu"
import ModuleContextMenu from "./ModuleContextMenu"

const SiteContextMenu = () => {
  const {
    menu,
    scope: { type: scopeType },
  } = useContext()

  if (!menu) return null

  const [pageX, pageY] = menu

  const onClose = () => void (context.menu = null)

  const props = { pageX, pageY, onClose }

  switch (scopeType) {
    case ScopeTypeEnum.Enum.LEVEL:
      return <LevelContextMenu {...props} />
    case ScopeTypeEnum.Enum.HOUSE:
      return <HouseContextMenu {...props} />
    case ScopeTypeEnum.Enum.MODULE:
      return <ModuleContextMenu {...props} />
    default:
      return null
  }
}

export default SiteContextMenu
