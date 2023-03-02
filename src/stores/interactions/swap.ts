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
}

const swap = proxy<Swap>({
  activeBuildingMatrix: null,
  dragModule: null,
  dragModuleResponder: null,
})

export default swap
