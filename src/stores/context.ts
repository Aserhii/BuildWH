import { proxy, useSnapshot } from "valtio"
import * as z from "zod"

export const EditModeEnum = z.enum(["MOVE_ROTATE", "STRETCH"])
export type EditMode = z.infer<typeof EditModeEnum>

type SiteContext = {
  sidebar: boolean
  buildingId: string | null
  levelIndex: number | null
  editMode: EditMode | null
  projectName: string | null
}

const siteContext = proxy<SiteContext>({
  sidebar: false,
  buildingId: null,
  levelIndex: null,
  editMode: null,
  projectName: null,
})

export const useSiteContext = () => useSnapshot(siteContext)

export const useProjectName = () => {
  const { projectName } = useSnapshot(siteContext)
  if (projectName === null || projectName.length <= 0) return "New project"
  else return projectName
}

export const SiteContextModeEnum = z.enum(["SITE", "BUILDING", "LEVEL"])
export type SiteContextMode = z.infer<typeof SiteContextModeEnum>

export const useSiteContextMode = (): SiteContextMode => {
  const { buildingId, levelIndex } = useSiteContext()

  return levelIndex !== null
    ? SiteContextModeEnum.Enum.LEVEL
    : buildingId !== null
    ? SiteContextModeEnum.Enum.BUILDING
    : SiteContextModeEnum.Enum.SITE
}

export const enterBuildingMode = (buildingId: string) => {
  if (siteContext.buildingId !== buildingId) siteContext.buildingId = buildingId
  if (siteContext.levelIndex !== null) siteContext.levelIndex = null
  if (siteContext.editMode !== EditModeEnum.Enum.STRETCH)
    siteContext.editMode = EditModeEnum.Enum.STRETCH
}

export const exitBuildingMode = () => {
  if (siteContext.levelIndex !== null) siteContext.levelIndex = null
  if (siteContext.buildingId !== null) siteContext.buildingId = null
  if (siteContext.editMode !== null) siteContext.editMode = null
}

export const enterLevelMode = (levelIndex: number) => {
  if (siteContext.levelIndex !== levelIndex) siteContext.levelIndex = levelIndex
}

export default siteContext
