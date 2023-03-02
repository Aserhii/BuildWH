import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { columnLayoutToDNA, useColumnLayout } from "@/hooks/layouts"
import { StairsOpt, useLayoutOptions, useStairsOptions } from "@/hooks/modules"
import houses from "@/stores/houses"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapA } from "@/utils"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import produce from "immer"
import React from "react"
import { useSnapshot } from "valtio"

type Props = ContextMenuProps & {
  buildingId: string
  levelIndex: number
}

const LevelContextMenu = (props: Props) => {
  if (scopes.primary.type !== ScopeTypeEnum.Enum.MODULE)
    throw new Error("LevelContextMenu scope invalid")

  const { buildingId, levelIndex } = props

  const scope = useSnapshot(scopes.primary)

  const { columnIndex, groupIndex } = scope.selected[0]

  const columnLayout = useColumnLayout(buildingId)

  const module =
    columnLayout[columnIndex].gridGroups[levelIndex].modules[groupIndex].module

  const { options: layoutOpts, selected: selectedLayoutOpt } = useLayoutOptions(
    module,
    columnLayout,
    {
      columnIndex,
      groupIndex,
      levelIndex,
    }
  )

  const changeLayout = ({ buildingDna }: typeof layoutOpts[0]["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  const { options: stairsOpts, selected: selectedStairsOpt } = useStairsOptions(
    module,
    columnLayout,
    {
      columnIndex,
      levelIndex,
      groupIndex,
    }
  )

  const changeStairs = ({ buildingDna }: StairsOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  const canChangeStairs = true
  const canChangeLayout = true

  return (
    <ContextMenu {...props}>
      {canChangeLayout && (
        <ContextMenuNested label="Change layout">
          <Radio
            options={layoutOpts}
            selected={selectedLayoutOpt}
            onChange={changeLayout}
          />
        </ContextMenuNested>
      )}
      {canChangeStairs && (
        <ContextMenuNested label="Change stairs">
          <Radio
            options={stairsOpts}
            selected={selectedStairsOpt}
            onChange={changeStairs}
          />
        </ContextMenuNested>
      )}
    </ContextMenu>
  )
}

export default LevelContextMenu
