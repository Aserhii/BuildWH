import { store } from "."

export const setCameraEnabled = (b: boolean) => {
  if (store.camControls) store.camControls.enabled = b
}

export const defaultCamPos: [number, number, number] = [12, 24, 12]
export const defaultCamTgt: [number, number, number] = [0, 0, 0]

export const setOrthographic = (b: boolean) => {
  store.orthographic = b
}
