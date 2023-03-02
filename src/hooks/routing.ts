import siteContext, { EditModeEnum } from "@/stores/context"
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
      if (siteContext.levelIndex) {
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
        siteContext.buildingId = params.buildingId
        siteContext.editMode = EditModeEnum.Enum.STRETCH
      }
      case "levelIndex" in params: {
        const levelIndex = Number(params.levelIndex)
        if (siteContext.levelIndex === levelIndex || isNaN(levelIndex)) break
        siteContext.levelIndex = levelIndex
        siteContext.editMode = null
        break
      }
      case !("buildingId" in params):
        if (siteContext.buildingId !== null) siteContext.buildingId = null
        if (siteContext.levelIndex !== null) siteContext.levelIndex = null
        if (siteContext.editMode !== EditModeEnum.Enum.MOVE)
          siteContext.editMode = EditModeEnum.Enum.MOVE
    }

    scope.selected = null
    scope.hovered = null
    urlChange = false
  }, [params])
}
