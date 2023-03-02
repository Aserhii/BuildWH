export interface BuildSystem {
  id: string
  name: string
  airtableId: string
}

export const buildSystems: Array<BuildSystem> = [
  {
    id: "sample",
    name: "Sample",
    airtableId: "appXYQYWjUiAT1Btm",
  },
  {
    id: "mobble",
    name: "Mobble",
    airtableId: "appYkSYalupnJmUA2",
  },
]
