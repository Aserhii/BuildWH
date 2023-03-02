import { DoubleSide, MeshStandardMaterial } from "three"

const handleMaterial = new MeshStandardMaterial({
  color: "white",
  emissive: "white",
  side: DoubleSide,
})

export default handleMaterial
