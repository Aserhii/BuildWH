import { proxy, useSnapshot } from "valtio"

const settings = proxy({
  orthographic: false,
  shadows: false,
})

export const setOrthographic = (b: boolean) => {
  settings.orthographic = b
}

export const useSettings = () => useSnapshot(settings)

export default settings
