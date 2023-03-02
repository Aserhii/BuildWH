import { objComp } from "@/utils"
import { proxy } from "valtio"
import * as z from "zod"
import context from "./context"
import highlights, { clearIlluminatedMaterials } from "./highlights"
import { MaterialKey } from "./materials"

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

export type Scope = PrimaryScope | SecondaryScope

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

export const initScope = (k: keyof Scopes, scopeType: ScopeType) => {
  scopes[k].type = scopeType
  scopes[k].hovered = null
  scopes[k].selected = []
}

export const initScopes = () => {
  const { buildingId, levelIndex } = context

  highlights.outlined = []
  clearIlluminatedMaterials()

  const set = (primary: ScopeType, secondary: ScopeType) => {
    initScope("primary", primary)
    initScope("secondary", secondary)
  }

  switch (true) {
    case buildingId === null:
      set(ScopeTypeEnum.Enum.HOUSE, ScopeTypeEnum.Enum.ZERO)
      break
    case levelIndex === null:
      set(ScopeTypeEnum.Enum.ELEMENT, ScopeTypeEnum.Enum.LEVEL)
      break
    case buildingId !== null && levelIndex !== null:
      set(ScopeTypeEnum.Enum.MODULE, ScopeTypeEnum.Enum.ZERO)
      break
  }
}

export const select = ({
  buildingId,
  columnIndex,
  levelIndex,
  groupIndex,
  elementName,
}: {
  buildingId: string
  columnIndex: number
  levelIndex: number
  groupIndex: number
  elementName: string
}) => {
  const { primary, secondary } = scopes
  switch (true) {
    case !!context.buildingId && !context.levelIndex: {
      if (
        primary.type !== ScopeTypeEnum.Enum.ELEMENT ||
        secondary.type !== ScopeTypeEnum.Enum.LEVEL
      )
        throw new Error("Unexpected scope types in select function")
      if (
        primary.selected.findIndex((x) => x.elementName === elementName) === -1
      )
        primary.selected = [{ elementName }]
      if (
        secondary.selected.findIndex((x) => x.levelIndex === levelIndex) === -1
      )
        secondary.selected = [{ levelIndex }]
      break
    }
    case !!context.buildingId && context.levelIndex !== null: {
      if (
        primary.type !== ScopeTypeEnum.Enum.MODULE ||
        secondary.type !== ScopeTypeEnum.Enum.ZERO
      )
        throw new Error("Unexpected scope types in select function")
      if (
        primary.selected.findIndex((x) =>
          objComp(x, { columnIndex, levelIndex, groupIndex })
        ) === -1
      )
        primary.selected = [{ columnIndex, levelIndex, groupIndex }]
      break
    }
  }
}

export default scopes
