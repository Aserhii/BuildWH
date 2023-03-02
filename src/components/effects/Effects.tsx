import { EffectComposer } from "@react-three/postprocessing"
// import { EdgeDetectionMode } from "postprocessing"
import React, { Suspense } from "react"
import Outline from "./Outline"
import SelectiveBloom from "./SelectiveBloom"

const Effects = () => {
  return (
    <Suspense fallback={null}>
      <EffectComposer autoClear={false} multisampling={8} disableNormalPass>
        <SelectiveBloom />
        <Outline />
        {/* <SMAA edgeDetectionMode={EdgeDetectionMode.DEPTH} /> */}
      </EffectComposer>
    </Suspense>
  )
}

export default Effects
