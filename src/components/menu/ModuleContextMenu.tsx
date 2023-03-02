import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { useHouse } from "@/stores/houses"
import scope, { ScopeTypeEnum } from "@/stores/scope"
import React from "react"

const ModuleContextMenu = (props: ContextMenuProps) => {
  if (scope.type !== ScopeTypeEnum.Enum.MODULE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const { houseId, rowIndex, gridIndex: gridIndex } = scope.selected[0]

  const house = useHouse(houseId)

  // const { houseTypes, modules: allModules } = useSystemsData()

  // const houseRows = useHouseRows(houseId)

  // const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)

  // const resetModule = () => {
  //   if (!houseType) return
  //   houses[houseId].dna = houseType.dna as string[]
  // }

  // const systemModules = allModules.filter(
  //   (m) => m.systemId === houseRows[0].row[0].module.systemId
  // )

  // const thisModule = houseRows[rowIndex].row[gridIndex].module

  // const moduleOptions = pipe(
  //   systemModules,
  //   filterCompatibleModules(["sectionType", "positionType", "levelType"])(
  //     thisModule
  //   ),
  //   map((x) => x.dna),
  //   uniq(Eq)
  // )

  const changeModule = (selectedDna: string) => {
    // const next = pipe(
    //   houseModules,
    //   map((x) => x.dna),
    //   modifyAt(moduleIndex, () => selectedDna),
    //   toNullable
    // )
    // if (next !== null) {
    //   store.houses[houseId].dna = next as string[]
    // }
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>Module</ContextMenuHeading>
      {/* <ContextMenuButton onClick={resetModule}>Reset Module</ContextMenuButton> */}
      <ContextMenuNested label="Switch Module">
        {/* <Radio
          options={moduleOptions.map((value) => ({ label: value, value }))}
          selected={thisModule.dna}
          onChange={changeModule}
        /> */}
      </ContextMenuNested>
    </ContextMenu>
  )
}

export default ModuleContextMenu
