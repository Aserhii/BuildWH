import { nativeEnum } from "zod"

export enum Tab {
  Overview = "overview",
  BuildingAreas = "building-areas",
  BuildCosts = "build-costs",
  EnergyUse = "energy-use",
  BuildingFabric = "building-fabric",
  OperationalCo2 = "operational-co2",
  EmbodiedCo2 = "embodied-co2",
}

const TabEnum = nativeEnum(Tab)

export const tabs: { id: Tab; label: string }[] = [
  { id: Tab.Overview, label: "Overview" },
  { id: Tab.BuildingAreas, label: "Building Areas" },
  { id: Tab.BuildCosts, label: "Build Costs" },
  { id: Tab.EnergyUse, label: "Energy Use" },
  { id: Tab.BuildingFabric, label: "Building Fabric" },
  { id: Tab.OperationalCo2, label: "Operational CO₂" },
  { id: Tab.EmbodiedCo2, label: "Embodied CO₂" },
]

export const fromSlug = (slug: string | undefined): Tab => {
  const parsed = TabEnum.safeParse(slug)
  if (parsed.success) {
    return parsed.data
  }
  return Tab.Overview
}
