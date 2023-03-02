import { BareModule } from "@/data/module"
import { proxy } from "valtio"
import { ScopeItem } from "./scope"

type SwapItem = Omit<ScopeItem, "buildingId" | "elementName">

type Swap = {
  activeBuildingMatrix: BareModule[][][] | null
  dragModulePing: {
    dpz: number
    z0: number
    length: number
  } | null
  dragModulePong: SwapItem | null
}

const swap = proxy<Swap>({
  activeBuildingMatrix: null,
  dragModulePing: null,
  dragModulePong: null,
})

export const getSibling = (incoming: SwapItem, direction: 1 | -1): SwapItem => {
  if (swap.activeBuildingMatrix === null)
    throw new Error("getSibling called with null swap.activeBuildingMatrix")

  let columnIndex = incoming.columnIndex,
    levelIndex = incoming.levelIndex,
    groupIndex = incoming.groupIndex

  switch (direction) {
    case 1:
      if (swap.activeBuildingMatrix?.[columnIndex][levelIndex][groupIndex + 1])
        groupIndex++
      else {
        columnIndex++
        groupIndex = 0
      }
    case -1:
      if (groupIndex > 0) groupIndex--
      else {
        columnIndex--
        groupIndex =
          swap.activeBuildingMatrix[columnIndex][levelIndex].length - 1
      }
  }

  if (
    typeof swap.activeBuildingMatrix?.[columnIndex]?.[levelIndex]?.[
      groupIndex
    ] === "undefined"
  )
    throw new Error("getLowerSibling result undefined")

  return { columnIndex, levelIndex, groupIndex }
}

export default swap
