import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { filterCompatibleModules, Module } from "@/data/module"
import { ModuleLayoutItem } from "@/data/moduleLayout"
import houses from "@/stores/houses"
import scopes from "@/stores/scope"
import scope, { ScopeTypeEnum } from "@/stores/scope"
import { filterMap, head, map, sort, uniq } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { Eq, Ord as StrOrd } from "fp-ts/lib/string"
import React from "react"

const SingleLevelContextMenu = (props: ContextMenuProps) => {
  const scope = scopes.secondary
  if (scope.type !== ScopeTypeEnum.Enum.LEVEL) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }
  if (scope.selected.length !== 1) {
    console.error(
      `SingleLevelContextMenu called but ${scope.selected.length} selected`
    )
    return null
  }

  // const { houseId, rowIndex } = scope.selected[0]
  // const { modules: allModules } = useSystemsData()
  // const houseRows = useHouseRows(houseId)

  // const systemModules = allModules.filter(
  //   (m) => m.systemId === houseRows[0].row[0].module.systemId
  // )

  // const levelModule = houseRows[rowIndex].row[0].module

  // const heading = `Level ${scope.selected[0].rowIndex}`

  // const height = rowIndex + 1

  // only allow "add floor above"
  // and only allow on... hmm...
  // what about extrude?

  // need some way to "fill vanilla modules here"
  // both with level extrude
  // and end-module extrude

  const addFloor = () => {
    // const targetLevelType = rowIndex ===
    // houses[houseId].dna = pipe(
    //   houseRows,
    //   map(col => pipe(col.row, map(row => row.module.dna))),
    //   modifyAt(rowIndex, row => row.row)
    // map(
    //   flow(
    //     splitAt(levelIndex + 1),
    //     ([init, rest]) => [
    //       ...init,
    //       getIntermediateModule(init[init.length - 1]),
    //       ...rest,
    //     ],
    //     filterMap((x) => (x !== null ? some(x.dna) : none))
    //   )
    // ),
    // flatten
    // )
    // const getIntermediateModule = (
    //   moduleLayoutItem: ModuleLayoutItem
    // ): ModuleLayoutItem | null => {
    //   const targetType = height - rowIndex <= 3 ? "T" : "M"
    //   return pipe(
    //     systemModules,
    //     filterMap<Module, ModuleLayoutItem>((module) =>
    //       module.dna.slice(0, 6) === moduleLayoutItem.dna.slice(0, 6) &&
    //       module.structuredDna.levelType.startsWith(targetType)
    //         ? some({
    //             dna: module.dna,
    //             position: moduleLayoutItem.position,
    //             grid: moduleLayoutItem.grid,
    //           })
    //         : none
    //     ),
    //     sort(
    //       pipe(
    //         StrOrd,
    //         contramap((m: ModuleLayoutItem) => m.dna)
    //       )
    //     ),
    //     head,
    //     toNullable
    //   )
    // }
  }

  const removeFloor = () => {
    // houses[houseId].dna = pipe(
    //   layout.modules,
    //   chunksOf(height),
    //   map((x) =>
    //     pipe(
    //       x,
    //       filterWithIndex((i, a) => i !== levelIndex + 1),
    //       map((x) => x.dna)
    //     )
    //   ),
    //   flatten
    // )
  }

  // const levelTypeOptions = pipe(
  //   systemModules,
  //   filterCompatibleModules(["sectionType", "positionType", "level"])(
  //     levelModule
  //   ),
  //   map((x) => x.structuredDna.levelType),
  //   uniq(Eq)
  // )

  // const levelType = levelModule.structuredDna.levelType

  const changeLevelType = (newLevelType: any) => {
    // const next = pipe(
    //   houses[houseId].dna,
    //   mapWithIndex((i, m) =>
    //     !levelModuleIndices.includes(i)
    //       ? m
    //       : pipe(
    //           systemModules,
    //           filterCompatibleModules(["sectionType", "positionType", "level"])(
    //             houseModules[i]
    //           ),
    //           (compatModules) =>
    //             pipe(
    //               compatModules,
    //               findFirstMap((x) => {
    //                 const xdnas = x.dna.split("-")
    //                 const mdnas = m.split("-")
    //                 return pipe(
    //                   zip(mdnas)(xdnas),
    //                   reduceWithIndex(
    //                     true,
    //                     (j, acc, [xs, ms]) =>
    //                       acc && (j === 2 ? xs !== ms : xs === ms)
    //                   )
    //                 )
    //                   ? some(x.dna)
    //                   : none
    //               }),
    //               alt(() => {
    //                 return pipe(
    //                   compatModules,
    //                   sort(
    //                     pipe(
    //                       StrOrd,
    //                       contramap((x: Module) => x.dna)
    //                     )
    //                   ),
    //                   findFirstMap((x) =>
    //                     x.structuredDna.levelType === newLevelType
    //                       ? some(x.dna)
    //                       : none
    //                   )
    //                 )
    //               }),
    //               toNullable
    //             )
    //         )
    //   )
    // )
    // const guard = (xs: (string | null)[]): xs is string[] => !xs.includes(null)
    // if (!guard(next)) return
    // store.houses[houseId].dna = next
  }

  return (
    <ContextMenu {...props}>
      {/* <ContextMenuHeading>{heading}</ContextMenuHeading> */}
      <ContextMenuButton onClick={addFloor}>Add floor above</ContextMenuButton>
      <ContextMenuButton onClick={removeFloor}>Remove floor</ContextMenuButton>
      <ContextMenuNested label="Change Level Type">
        {/* <Radio
          options={levelTypeOptions.map((value) => ({ label: value, value }))}
          selected={levelType}
          onChange={changeLevelType}
        /> */}
      </ContextMenuNested>
    </ContextMenu>
  )
}

const ManyLevelsContextMenu = (props: ContextMenuProps) => {
  const scope = scopes.secondary
  if (scope.type !== ScopeTypeEnum.Enum.LEVEL) {
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
  const levels = scopes.secondary.selected.length

  return levels > 1 ? (
    <ManyLevelsContextMenu {...props} />
  ) : (
    <SingleLevelContextMenu {...props} />
  )
}

export default LevelContextMenu
