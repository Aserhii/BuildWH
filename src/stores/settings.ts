import { proxy, useSnapshot } from "valtio"
import * as z from "zod"

export const MapDisplayEnum = z.enum(["D2", "D3"])

export type MapDisplay = z.infer<typeof MapDisplayEnum> | null

const settings = proxy({
  orthographic: false,
  shadows: false,
  verticalCuts: {
    width: false,
    length: false,
  },
  mapDisplay: MapDisplayEnum.Enum.D2 as MapDisplay,
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
