import { BareModule } from "@/data/module"
import { proxy } from "valtio"
import { ScopeItem } from "../scope"

type Swap = {
  activeBuildingMatrix: BareModule[][][] | null
  dragModule: {
    dz: number
    z0: number
    length: number
  } | null
  dragModuleResponder: Omit<ScopeItem, "buildingId" | "elementName"> | null
  dragModuleShifted: "UP" | "DOWN" | null
}

const swap = proxy<Swap>({
  activeBuildingMatrix: null,
  dragModule: null,
  dragModuleResponder: null,
  dragModuleShifted: null,
})

export default swap
