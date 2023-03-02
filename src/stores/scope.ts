import { proxy } from "valtio"

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
  locked: boolean
}

const scope = proxy<Scope>({
  hovered: null,
  selected: null,
  locked: false,
})

export const isSelected = (si: Partial<ScopeItem>) => {
  if (scope.selected === null) return false
  for (let k of Object.keys(si) as Array<keyof ScopeItem>) {
    if (scope.selected[k] !== si[k]) return false
  }
  return true
}

export const isHovered = (si: Partial<ScopeItem>) => {
  if (scope.hovered === null) return false
  for (let k of Object.keys(si) as Array<keyof ScopeItem>) {
    if (scope.hovered[k] !== si[k]) return false
  }
  return true
}

export default scope
