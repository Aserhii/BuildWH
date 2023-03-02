import { load } from "@loaders.gl/core"
import { MVTLoader as _MVTLoader } from "@loaders.gl/mvt"
import { Feature } from "geojson"
import { Loader, LoadingManager } from "three"

class MVTLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  load(
    url: string, // stringified [x,y,zoom]
    onLoad?: (data: Feature[]) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): Feature[] {
    const features: Feature[] = []

    ;(async () => {
      try {
        const urlChunks = url.split("/")

        const x = Number(urlChunks[6])
        const y = Number(urlChunks[7].split(".")[0])
        const z = Number(urlChunks[5])

        const loaderOptions = {
          mvt: {
            coordinates: "wgs84",
            tileIndex: {
              x,
              y,
              z,
            },
          },
        }

        const geometryData = await load(url, _MVTLoader, loaderOptions)

        geometryData.forEach((x: any) => void features.push(x))
        onLoad?.(geometryData)
      } catch (e) {
        if (e instanceof ErrorEvent) {
          onError?.(e)
        }
      }
      return features
    })()

    return []
  }

  loadAsync(
    url: string,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<Feature> {
    return load(url, _MVTLoader)
  }
}

export default MVTLoader
