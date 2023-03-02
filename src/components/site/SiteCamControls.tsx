import { CamControls } from "@/components/ui-3d/CamControls"
import camera, { defaultCamPos } from "@/stores/camera"
import { useSettings } from "@/stores/settings"
import { useUserAgent } from "@oieduardorabelo/use-user-agent"
import { OrthographicCamera, PerspectiveCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import React, { Fragment } from "react"
import { ref } from "valtio"

const SiteCamControls = () => {
  const { orthographic, shadows } = useSettings()
  const size = useThree(({ size }) => size)
  const ratio = 10
  const userAgent = useUserAgent()
  // const focusedBuildingId = useFocusedBuildingId();
  const dollyToCursor = true //!focusedBuildingId;
  const truckSpeed = 2.0 // !focusedBuildingId ? 2.0 : 0.0;
  return (
    <Fragment>
      <PerspectiveCamera position={defaultCamPos} makeDefault={!orthographic} />
      <OrthographicCamera
        position={defaultCamPos}
        left={-size.width / 2 / ratio}
        right={size.width / 2 / ratio}
        top={size.height / 2 / ratio}
        bottom={-size.height / 2 / ratio}
        near={-500}
        far={500}
        makeDefault={orthographic}
      />
      <CamControls
        {...{
          maxPolarAngle: shadows ? Math.PI / 2 : Math.PI,
          maxDistance: 100,
          minZoom: 0.2,
          dollySpeed:
            userAgent?.os?.name &&
            ["Mac OS"].includes(String(userAgent.os.name))
              ? -1.0
              : 1.0,
          dollyToCursor,
          truckSpeed,
          restThreshold: 0.01,
          dampingFactor: 0.25,
        }}
        setControls={(controls) => void (camera.controls = ref(controls))}
      />
    </Fragment>
  )
}

export default SiteCamControls
