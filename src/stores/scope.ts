import { proxy } from "valtio"
import * as z from "zod"

export const ScopeTypeEnum = z.enum([
  "HOUSE",
  "LEVEL",
  "MODULE",
  "ELEMENT",
  "ZERO",
])

export type ScopeType = z.infer<typeof ScopeTypeEnum>

export type HouseScope = {
  type: "HOUSE"
  selected: string[] // houseId's
  hovered: string | null
}

export type ModuleScopeItem = {
  columnIndex: number
  levelIndex: number
  groupIndex: number
}

export type ModuleScope = {
  type: "MODULE"
  selected: ModuleScopeItem[]
  hovered: ModuleScopeItem | null
}

export type ElementScopeItem = {
  elementName: string
}

export type ElementScope = {
  type: "ELEMENT"
  selected: ElementScopeItem[]
  hovered: ElementScopeItem | null
}

export type LevelScopeItem = {
  levelIndex: number
}

export type LevelScope = {
  type: "LEVEL"
  selected: LevelScopeItem[]
  hovered: LevelScopeItem | null
}

export type ZeroScope = {
  type: "ZERO"
  selected: []
  hovered: null
}

export type PrimaryScope = ElementScope | HouseScope | ModuleScope

export type SecondaryScope = LevelScope | ZeroScope

const initPrimaryScope = (): HouseScope => ({
  type: ScopeTypeEnum.enum.HOUSE,
  selected: [],
  hovered: null,
})

const initSecondaryScope = (): ZeroScope => ({
  type: "ZERO",
  hovered: null,
  selected: [],
})

export type Scopes = {
  primary: PrimaryScope
  secondary: SecondaryScope
}

const scopes = proxy<Scopes>({
  primary: initPrimaryScope(),
  secondary: initSecondaryScope(),
})

export default scopes
