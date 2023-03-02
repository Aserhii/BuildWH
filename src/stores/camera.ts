import CameraControls from "camera-controls"
import { proxy } from "valtio"

type CameraProxy = {
  controls: CameraControls | null
}

const camera = proxy<CameraProxy>({
  controls: null,
})

export const defaultCamPos: [number, number, number] = [12, 24, 12]
export const defaultCamTgt: [number, number, number] = [0, 0, 0]

export const setCameraEnabled = (b: boolean) => {
  if (camera.controls) camera.controls.enabled = b
}

export default camera
