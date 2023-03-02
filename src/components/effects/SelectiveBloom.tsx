import { CameraLayer, EffectsLayer } from "@/CONSTANTS"
import { useBloomLightRef, useIlluminated } from "@/stores/highlights"
import { SelectiveBloom as SelectiveBloom_ } from "@react-three/postprocessing"
import React, { Fragment, useEffect, useRef } from "react"
import { useSnapshot } from "valtio"

const SelectiveBloom = () => {
  // const lightRef = useRef()
  const illuminated = useIlluminated()
  // const lightRef = useBloomLightRef()

  // useEffect(() => void console.log(lightRef), [lightRef])

  // useEffect(() => void console.log(illuminated), [illuminated])

  const intensity = 1 // illuminated.length > 0 ? 1 : 0
  return (
    <Fragment>
      <SelectiveBloom_
        kernelSize={4}
        luminanceThreshold={0}
        intensity={intensity}
        luminanceSmoothing={0}
        selection={illuminated}
        selectionLayer={EffectsLayer.bloom}
        // lights={[lightRef].filter((x) => !!x)}
      />
    </Fragment>
  )
}

export default SelectiveBloom
