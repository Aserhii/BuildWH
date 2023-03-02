import { store } from "@/store"
import { useThree } from "@react-three/fiber"
import { EffectComposer, Outline, SMAA } from "@react-three/postprocessing"
import { EdgeDetectionMode } from "postprocessing"
import React, { Suspense, useEffect } from "react"
import { useSnapshot } from "valtio"

const Effects = () => {
  const size = useThree((three) => three.size)
  const { outlined } = useSnapshot(store)

  return (
    <Suspense fallback={null}>
      <EffectComposer autoClear={false} multisampling={8} disableNormalPass>
        <Outline
          blur
          selection={outlined.filter((x) => !!x.current) as any}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0xffffff}
          edgeStrength={32}
          width={size.width / 2}
          height={size.height / 2}
        />
        <SMAA edgeDetectionMode={EdgeDetectionMode.DEPTH} />
      </EffectComposer>
    </Suspense>
  )
}

export default Effects
