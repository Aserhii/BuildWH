import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { filterCompatibleModules } from "@/data/module"
import { ScopeTypeEnum, store, useHouse, useHouseModules } from "@/store"
import { useSystemsData } from "@/store/systems"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { map, modifyAt, uniq } from "fp-ts/lib/ReadonlyArray"
import { Eq } from "fp-ts/lib/string"
import React from "react"

const ModuleContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.MODULE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const { houseId, moduleIndex } = store.scope.selected[0]

  const house = useHouse(houseId)

  const { houseTypes, modules: allModules } = useSystemsData()

  const houseModules = useHouseModules(houseId)

  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)

  const resetModule = () => {
    if (!houseType) return
    store.houses[houseId].dna = houseType.dna as string[]
  }

  const systemModules = allModules.filter(
    (m) => m.systemId === houseModules[0].systemId
  )

  const thisModule = houseModules[store.scope.selected[0].moduleIndex]

  const moduleOptions = pipe(
    systemModules,
    filterCompatibleModules(["sectionType", "positionType", "levelType"])(
      thisModule
    ),
    map((x) => x.dna),
    uniq(Eq)
  )

  const changeModule = (selectedDna: string) => {
    const next = pipe(
      houseModules,
      map((x) => x.dna),
      modifyAt(moduleIndex, () => selectedDna),
      toNullable
    )

    if (next !== null) {
      store.houses[houseId].dna = next as string[]
    }
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>Module</ContextMenuHeading>
      <ContextMenuButton onClick={resetModule}>Reset Module</ContextMenuButton>
      <ContextMenuNested label="Switch Module">
        <Radio
          options={moduleOptions.map((value) => ({ label: value, value }))}
          selected={thisModule.dna}
          onChange={changeModule}
        />
      </ContextMenuNested>
    </ContextMenu>
  )
}

export default ModuleContextMenu
