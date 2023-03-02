import { proxy, useSnapshot } from "valtio"

const settings = proxy({
  orthographic: false,
  shadows: true,
  verticalCuts: {
    width: false,
    length: false,
  },
})

export const setOrthographic = (b: boolean) => {
  settings.orthographic = b
}

export const setVerticalCuts = (input: string[]) => {
  settings.verticalCuts.width = input.includes("width")
  settings.verticalCuts.length = input.includes("length")
}

export const useVerticalCuts = () => {
  const { verticalCuts } = useSettings()
  return [verticalCuts, setVerticalCuts] as const
}

export const useSettings = () => useSnapshot(settings)

export const setShadows = (b: boolean) => {
  settings.shadows = b
}

export const useShadows = () => {
  const { shadows } = useSettings()

  return [shadows, setShadows] as const
}

export default settings
