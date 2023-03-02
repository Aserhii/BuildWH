import { MeshPhysicalMaterial } from "three"
import glassMaterial from "./glassMaterial"

const builtInMaterials: Record<string, MeshPhysicalMaterial> = {
  Glazing: glassMaterial,
}

export default builtInMaterials
