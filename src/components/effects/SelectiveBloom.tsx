import { EffectsLayer } from "@/CONSTANTS"
import { SelectiveBloom as SelectiveBloom_ } from "@react-three/postprocessing"
import React, { Fragment } from "react"

const SelectiveBloom = () => {
  // const lightRef = useRef()
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
        selection={[]}
        selectionLayer={EffectsLayer.bloom}
        // lights={[lightRef].filter((x) => !!x)}
      />
    </Fragment>
  )
}

export default SelectiveBloom
