import siteContext, {
  EditModeEnum,
  enterBuildingMode,
  enterLevelMode,
  exitBuildingMode,
} from "@/stores/context"
import scope from "@/stores/scope"
import { useRoute } from "@/utils/wouter"
import { useEffect } from "react"
import { subscribe } from "valtio"
import { useLocation } from "wouter"

export const useRouting = () => {
  const [, setLocation] = useLocation()
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  let urlChange = false

  subscribe(siteContext, () => {
    if (urlChange) return
    let path = "/site"
    if (siteContext.buildingId) {
      path += `?buildingId=${siteContext.buildingId}`
      if (siteContext.levelIndex !== null) {
        path += `&levelIndex=${siteContext.levelIndex}`
      }
    }
    if (path !== window.location.pathname + window.location.search) {
      setLocation(path)
    }
  })

  useEffect(() => {
    urlChange = true

    if (params === null || typeof params === "boolean") return
    switch (true) {
      case "buildingId" in params &&
        siteContext.buildingId !== params.buildingId: {
        enterBuildingMode(params.buildingId)
      }
      case "levelIndex" in params: {
        const levelIndex = Number(params.levelIndex)
        if (siteContext.levelIndex === levelIndex || isNaN(levelIndex)) break
        enterLevelMode(levelIndex)
        break
      }
      case !("buildingId" in params):
        exitBuildingMode()
    }

    scope.selected = null
    scope.hovered = null
    urlChange = false
  }, [params])
}
