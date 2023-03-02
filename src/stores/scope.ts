import { proxy, useSnapshot } from "valtio"
import * as z from "zod"

export const ScopeTypeEnum = z.enum(["HOUSE", "LEVEL", "MODULE", "ELEMENT"])

export type ScopeType = z.infer<typeof ScopeTypeEnum>

export type HouseScope = {
  type: "HOUSE"
  selected: string[] // houseId's
  hovered: string | null
}

export type ModuleScopeItem = {
  rowIndex: number
  gridIndex: number
  houseId: string
}

export type ModuleScope = {
  type: "MODULE"
  selected: ModuleScopeItem[]
  hovered: ModuleScopeItem | null
}

export type ElementScopeItem = {
  elementName: string
  houseId: string
}

export type ElementScope = {
  type: "ELEMENT"
  selected: ElementScopeItem[]
  hovered: ElementScopeItem | null
}

export type LevelScopeItem = {
  houseId: string
  rowIndex: number
}

export type LevelScope = {
  type: "LEVEL"
  selected: LevelScopeItem[]
  hovered: LevelScopeItem | null
}

export type Scope = HouseScope | LevelScope | ModuleScope | ElementScope

export type FocusedHouseScope = LevelScope | ModuleScope | ElementScope

const getInitScope = (): HouseScope => ({
  type: ScopeTypeEnum.enum.HOUSE,
  selected: [],
  hovered: null,
})

const scope = proxy<Scope>(getInitScope())

export const setScopeType = (type: ScopeType) => {
  scope.type = type
  scope.selected = []
  scope.hovered = null
}

export const useScopeType = () => {
  const { type: scopeType } = useSnapshot(scope)
  return scopeType
}

export const useSelected = () => {
  const { selected } = useSnapshot(scope)
  return selected
}

export default scope
