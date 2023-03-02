import { useLoader } from "@react-three/fiber"
import { IFCLoader } from "web-ifc-three"

const useIfcModels = (modelUrls: string[]) =>
  useLoader(IFCLoader, modelUrls, (loader) => {
    if (loader instanceof IFCLoader) {
      loader.ifcManager.setWasmPath("../../../wasm/")
    }
  })

export default useIfcModels
