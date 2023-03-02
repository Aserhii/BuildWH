import context, { EditModeEnum } from "@/stores/context"
import { useRoute } from "@/utils/wouter"
import { useEffect } from "react"
import { subscribe } from "valtio"
import { useLocation } from "wouter"

export const useRouting = () => {
  const [, setLocation] = useLocation()
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  let urlChange = false

  subscribe(context, () => {
    if (urlChange) return
    let path = "/site"
    if (context.buildingId) {
      path += `?buildingId=${context.buildingId}`
      if (context.levelIndex) {
        path += `&levelIndex=${context.levelIndex}`
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
      case "buildingId" in params && context.buildingId !== params.buildingId: {
        context.buildingId = params.buildingId
        context.editMode = EditModeEnum.Enum.STRETCH
      }
      case "levelIndex" in params: {
        const levelIndex = Number(params.levelIndex)
        if (context.levelIndex === levelIndex || isNaN(levelIndex)) break
        context.levelIndex = levelIndex
        context.editMode = null
        break
      }
      case !("buildingId" in params):
        if (context.buildingId !== null) context.buildingId = null
        if (context.levelIndex !== null) context.levelIndex = null
        if (context.editMode !== EditModeEnum.Enum.MOVE)
          context.editMode = EditModeEnum.Enum.MOVE
    }

    urlChange = false
  }, [params])
}
