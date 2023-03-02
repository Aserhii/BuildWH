import { proxy, useSnapshot } from "valtio"
import scope from "./scope"

const settings = proxy({
  scope,
  orthographic: false,
  shadows: false,
})

export const setOrthographic = (b: boolean) => {
  settings.orthographic = b
}

export const useSettings = () => useSnapshot(settings)

export default settings
