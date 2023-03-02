import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { useColumnLayout } from "@/hooks/layouts"
import {
  StairsOpt,
  useLayoutOptions,
  useStairsOptions,
  useWindowOptions,
  WindowOpt,
} from "@/hooks/modules"
import houses from "@/stores/houses"
import scope from "@/stores/scope"
import React from "react"

type Props = ContextMenuProps

const LevelContextMenu = (props: Props) => {
  if (scope.selected === null) throw new Error("scope.selected null")

  const { groupIndex, levelIndex, columnIndex, buildingId } = scope.selected

  const columnLayout = useColumnLayout(buildingId)

  const { options: layoutOpts, selected: selectedLayoutOpt } = useLayoutOptions(
    columnLayout,
    {
      columnIndex,
      groupIndex,
      levelIndex,
    }
  )

  const canChangeLayout = layoutOpts.length > 1

  const changeLayout = ({ buildingDna }: typeof layoutOpts[0]["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  const { options: stairsOpts, selected: selectedStairsOpt } = useStairsOptions(
    columnLayout,
    {
      columnIndex,
      levelIndex,
      groupIndex,
    }
  )

  const canChangeStairs = stairsOpts.length > 1

  const changeStairs = ({ buildingDna }: StairsOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

  const { options: windowOpts, selected: selectedWindowOpt } = useWindowOptions(
    columnLayout,
    {
      columnIndex,
      levelIndex,
      groupIndex,
    }
  )

  const canChangeWindow = windowOpts.length > 1

  const changeWindow = ({ buildingDna }: WindowOpt["value"]) => {
    houses[buildingId].dna = buildingDna
    props.onClose?.()
  }

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
            compare={(a, b) => a.stairType === b.stairType}
          />
        </ContextMenuNested>
      )}
      {canChangeWindow && (
        <ContextMenuNested long label="Change window">
          <Radio
            options={windowOpts}
            selected={selectedWindowOpt}
            onChange={changeWindow}
          />
        </ContextMenuNested>
      )}
    </ContextMenu>
  )
}

export default LevelContextMenu
