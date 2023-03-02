import { useEffect } from "react"
import { proxy, useSnapshot } from "valtio"
import * as z from "zod"

export const EditModeEnum = z.enum(["MOVE_ROTATE", "STRETCH"])
export type EditMode = z.infer<typeof EditModeEnum>

type SiteContext = {
  menu: [number, number] | null
  sidebar: boolean
  buildingId: string | null
  levelIndex: number | null
  editMode: EditMode | null
}

const siteContext = proxy<SiteContext>({
  menu: null,
  sidebar: false,
  buildingId: null,
  levelIndex: null,
  editMode: null,
})

export const useSiteContext = () => useSnapshot(siteContext)

export const SiteContextModeEnum = z.enum(["SITE", "BUILDING", "LEVEL"])
export type SiteContextMode = z.infer<typeof SiteContextModeEnum>

export const useSiteContextMode = () => {
  const { buildingId, levelIndex } = useSiteContext()

  const mode =
    levelIndex !== null
      ? SiteContextModeEnum.Enum.LEVEL
      : buildingId !== null
      ? SiteContextModeEnum.Enum.BUILDING
      : SiteContextModeEnum.Enum.SITE

  useEffect(() => {
    if (mode === SiteContextModeEnum.Enum.LEVEL) {
      siteContext.editMode = null
    } else if (mode === SiteContextModeEnum.Enum.BUILDING) {
      siteContext.editMode = EditModeEnum.Enum.STRETCH
    }
  }, [mode])

  return mode
}

export default siteContext
