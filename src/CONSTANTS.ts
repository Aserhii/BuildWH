// Layer :

export enum CameraLayer {
  visible = 0,
  invisible = 1,
}

export enum RaycasterLayer {
  clickable = 2,
  non_clickable = 3,
}

export enum EffectsLayer {
  outline = 4,
  bloom = 5,
}

export const BUILDX_LOCAL_STORAGE_HOUSES_KEY = "buildx-houses-0.1.0"
export const BUILDX_LOCAL_STORAGE_CONTEXT_KEY = "buildx-context-0.1.0"
export const BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY = "buildx-polygon-0.1.0"

export const DEFAULT_MATERIAL_NAME = "Plywood"

export const DEFAULT_ORIGIN: [number, number] = [51.54093, -0.055219] // mare st
// [52.455449, -1.923407] // lat, lon // track and field
