// Layer :

export enum CameraLayer {
  visible = 0,
  invisible = 1,
}

export enum RaycasterLayer {
  clickable = 3,
  non_clickable = 4,
}

export const BUILDX_LOCAL_STORAGE_HOUSES_KEY = "BUILDX_LOCAL_STORAGE_HOUSES_KEY"
export const BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY =
  "BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY"

// type SetTypes = {
//   [key: string]: string[][][]
// }

type SetTypeOption = {
  label: string
  modules: string[][]
}

export type SetTypeSpec = {
  label: string
  target: string[][]
  options: Array<SetTypeOption>
}

type SetTypeSpecs = Record<string, SetTypeSpec>

export const setTypeSpecs: SetTypeSpecs = {
  ST: {
    label: "Change stair type",
    target: [["S1-MID-G1", "S1-MID-R2"]],
    options: [
      {
        label: "ST0",
        modules: [["S1-MID-G1-ST0", "S1-MID-R2-ST0"]],
      },
      {
        label: "ST2",
        modules: [["S1-MID-G1-ST2", "S1-MID-R2-ST2"]],
      },
    ],
  },
}
