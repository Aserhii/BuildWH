import { proxy } from "valtio"
import siteContext from "./context"
import highlights, { clearIlluminatedMaterials } from "./highlights"

export type ScopeItem = {
  elementName: string
  groupIndex: number
  levelIndex: number
  columnIndex: number
  buildingId: string
}

export type Scope = {
  selected: ScopeItem | null
  hovered: ScopeItem | null
}

const scope = proxy<Scope>({
  hovered: null,
  selected: null,
})

export default scope
