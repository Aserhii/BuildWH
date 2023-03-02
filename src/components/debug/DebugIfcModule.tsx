import { Module } from "@/data/module"
import { useBVH } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { useRef } from "react"
import { Group, Mesh } from "three"
import { IFCLoader } from "web-ifc-three"

type Props = {
  module: Module
}

const DebugIfcModule = (props: Props) => {
  const { module } = props

  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)

  if (typeof module.ifcUrl !== "string")
    throw new Error(`no string IFC url in DebugIfcModule ${module.dna}`)

  const { geometry, material, ifcManager, modelID } = useLoader(
    IFCLoader,
    module.ifcUrl as string,
    (loader) => {
      if (loader instanceof IFCLoader) {
        loader.ifcManager.setWasmPath("../../../../wasm/")
      }
    }
  )

  useBVH(meshRef as any)

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        {...{ geometry, material }}
        onClick={({ faceIndex }) => {
          const group = groupRef.current
          if (!ifcManager || !faceIndex || !group) {
            console.log({ ifcManager, faceIndex, group })
            return
          }
          const expressID = ifcManager.getExpressId(geometry, faceIndex)
          const ifcType = ifcManager.getIfcType(modelID, expressID)

          console.log(ifcType)
        }}
      />
    </group>
  )
}
export default DebugIfcModule
