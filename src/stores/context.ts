import { BUILDX_LOCAL_STORAGE_CONTEXT_KEY } from "@/CONSTANTS"
import { SSR } from "@/utils"
import { useEffect } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"
import * as z from "zod"
import houses from "./houses"

export const EditModeEnum = z.enum(["MOVE_ROTATE", "STRETCH"])
export type EditMode = z.infer<typeof EditModeEnum>

type SiteContext = {
  sidebar: boolean
  buildingId: string | null
  levelIndex: number | null
  editMode: EditMode | null
  projectName: string | null
  region: "UK" | "EU"
}

const defaults = {
  sidebar: false,
  buildingId: null,
  levelIndex: null,
  editMode: null,
  projectName: null,
  region: "EU",
}

export const getInitialContext = () =>
  SSR
    ? defaults
    : JSON.parse(
        localStorage.getItem(BUILDX_LOCAL_STORAGE_CONTEXT_KEY) ??
          JSON.stringify(defaults)
      )

const siteContext = proxy<SiteContext>(getInitialContext())

export const useSiteContext = () => useSnapshot(siteContext)

export const useLocallyStoredContext = () => {
  useEffect(
    subscribe(siteContext, () => {
      localStorage.setItem(
        BUILDX_LOCAL_STORAGE_CONTEXT_KEY,
        JSON.stringify(siteContext)
      )
    }),
    []
  )
}
export const useProjectName = () => {
  const ctx = useSnapshot(siteContext)
  const { projectName } = ctx
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

export const useSiteCurrency = () => {
  const { region } = useSiteContext()
  return {
    symbol: region === "UK" ? "£" : "€",
    code: region === "UK" ? "GBP" : "EUR",
  }
}

export const useSystemId = () => {
  const { buildingId } = useSiteContext()
  if (buildingId === null) return null
  return houses[buildingId].systemId
}

export default siteContext
