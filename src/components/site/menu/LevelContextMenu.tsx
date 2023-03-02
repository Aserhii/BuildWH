import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { filterCompatibleModules, Module } from "@/data/module"
import { moduleLayout, ModuleLayoutItem } from "@/data/moduleLayout"
import { ScopeTypeEnum, store, useHouseModules } from "@/store"
import { useSystemsData } from "@/store/systems"
import {
  chunksOf,
  filterMap,
  filterWithIndex,
  findFirstMap,
  flatten,
  head,
  map,
  mapWithIndex,
  reduceWithIndex,
  sort,
  splitAt,
  uniq,
  zip,
} from "fp-ts/lib/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { alt, none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { Eq, Ord as StrOrd } from "fp-ts/lib/string"
import React from "react"

const SingleLevelContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.LEVEL) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }
  if (store.scope.selected.length !== 1) {
    console.error(
      `SingleLevelContextMenu called but ${store.scope.selected.length} selected`
    )
    return null
  }

  const levelIndex = store.scope.selected[0].levelModuleIndices[0]
  const { modules: allModules } = useSystemsData()

  const houseId = store.scope.selected[0].houseId
  const houseModules = useHouseModules(houseId)
  const layout = moduleLayout(houseModules)
  const systemModules = allModules.filter(
    (m) => m.systemId === houseModules[0].systemId
  )

  const levelModuleIndices = store.scope.selected[0].levelModuleIndices
  const levelModule = houseModules[levelModuleIndices[0]]

  const heading = `Level ${store.scope.selected[0].levelModuleIndices[0]}`

  const height = layout.gridBounds[1] + 1

  const addFloor = () => {
    const getIntermediateModule = (
      moduleLayoutItem: ModuleLayoutItem
    ): ModuleLayoutItem | null => {
      const targetType = height - levelIndex <= 3 ? "T" : "M"

      return pipe(
        systemModules,
        filterMap<Module, ModuleLayoutItem>((module) =>
          module.dna.slice(0, 6) === moduleLayoutItem.dna.slice(0, 6) &&
          module.structuredDna.levelType.startsWith(targetType)
            ? some({
                dna: module.dna,
                position: moduleLayoutItem.position,
                grid: moduleLayoutItem.grid,
              })
            : none
        ),
        sort(
          pipe(
            StrOrd,
            contramap((m: ModuleLayoutItem) => m.dna)
          )
        ),
        head,
        toNullable
      )
    }

    store.houses[houseId].dna = pipe(
      layout.modules,
      chunksOf(height),
      map(
        flow(
          splitAt(levelIndex + 1),
          ([init, rest]) => [
            ...init,
            getIntermediateModule(init[init.length - 1]),
            ...rest,
          ],
          filterMap((x) => (x !== null ? some(x.dna) : none))
        )
      ),
      flatten
    )
  }

  const removeFloor = () => {
    const height = layout.gridBounds[1] + 1
    store.houses[houseId].dna = pipe(
      layout.modules,
      chunksOf(height),
      map((x) =>
        pipe(
          x,
          filterWithIndex((i, a) => i !== levelIndex + 1),
          map((x) => x.dna)
        )
      ),
      flatten
    )
  }

  const levelTypeOptions = pipe(
    systemModules,
    filterCompatibleModules(["sectionType", "positionType", "level"])(
      levelModule
    ),
    map((x) => x.structuredDna.levelType),
    uniq(Eq)
  )

  const levelType = levelModule.structuredDna.levelType

  const changeLevelType = (newLevelType: any) => {
    const next = pipe(
      store.houses[houseId].dna,
      mapWithIndex((i, m) =>
        !levelModuleIndices.includes(i)
          ? m
          : pipe(
              systemModules,
              filterCompatibleModules(["sectionType", "positionType", "level"])(
                houseModules[i]
              ),
              (compatModules) =>
                pipe(
                  compatModules,
                  findFirstMap((x) => {
                    const xdnas = x.dna.split("-")
                    const mdnas = m.split("-")
                    return pipe(
                      zip(mdnas)(xdnas),
                      reduceWithIndex(
                        true,
                        (j, acc, [xs, ms]) =>
                          acc && (j === 2 ? xs !== ms : xs === ms)
                      )
                    )
                      ? some(x.dna)
                      : none
                  }),
                  alt(() => {
                    return pipe(
                      compatModules,
                      sort(
                        pipe(
                          StrOrd,
                          contramap((x: Module) => x.dna)
                        )
                      ),
                      findFirstMap((x) =>
                        x.structuredDna.levelType === newLevelType
                          ? some(x.dna)
                          : none
                      )
                    )
                  }),
                  toNullable
                )
            )
      )
    )

    const guard = (xs: (string | null)[]): xs is string[] => !xs.includes(null)

    if (!guard(next)) return

    store.houses[houseId].dna = next
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>{heading}</ContextMenuHeading>
      <ContextMenuButton onClick={addFloor}>Add floor above</ContextMenuButton>
      <ContextMenuButton onClick={removeFloor}>Remove floor</ContextMenuButton>
      <ContextMenuNested label="Change Level Type">
        <Radio
          options={levelTypeOptions.map((value) => ({ label: value, value }))}
          selected={levelType}
          onChange={changeLevelType}
        />
      </ContextMenuNested>
    </ContextMenu>
  )
}

const ManyLevelsContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.LEVEL) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  return (
    <ContextMenu {...props}>
      {/* <ContextMenuHeading>{heading}</ContextMenuHeading>
      <ContextMenuButton onClick={addFloor}>Add floor above</ContextMenuButton>
      <ContextMenuButton onClick={removeFloor}>Remove floor</ContextMenuButton>
      <ContextMenuNested label="Change Level Type">
        <Radio
          options={levelTypeOptions.map((value) => ({ label: value, value }))}
          selected={levelType}
          onChange={changeLevelType}
        />
      </ContextMenuNested> */}
    </ContextMenu>
  )
}

const LevelContextMenu = (props: ContextMenuProps) => {
  const levels = store.scope.selected.length

  return levels > 1 ? (
    <ManyLevelsContextMenu {...props} />
  ) : (
    <SingleLevelContextMenu {...props} />
  )
}

export default LevelContextMenu
