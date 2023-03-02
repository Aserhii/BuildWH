import type { System } from "@/data/system"
import { GltfT } from "@/utils"
import { filter } from "fp-ts/lib/Array"
import type { StructuredDna } from "./moduleLayout"
import { parseDna } from "./moduleLayout"
import { getAirtableEntries } from "./utils"

export interface Module {
  id: string
  systemId: string
  dna: string
  structuredDna: StructuredDna
  modelUrl: string
  width: number
  height: number
  length: number
  cost: number // Euros
  embodiedCarbon: number // kgCO2
  visualReference?: string
}

export type LoadedModule = Omit<Module, "modelUrl"> & {
  gltf: GltfT
}

export const getModules = (system: System): Promise<Array<Module>> =>
  getAirtableEntries({ tableId: system.airtableId, tab: "modules" })
    .then((res) =>
      res.records.map((record: any) => {
        const dna = record.fields?.["module_code"] ?? ""
        return {
          id: record.id,
          systemId: system.id,
          dna,
          structuredDna: parseDna(dna),
          modelUrl: record.fields?.["GLB_model"]?.[0]?.url ?? "",
          width: record.fields?.["section_width"]?.[0] ?? 1,
          height: record.fields?.["level_height"]?.[0] ?? 1,
          length: record.fields?.["length_dims"] ?? 0,
          cost: record.fields?.["baseline_module_cost"] ?? 1500,
          embodiedCarbon: record.fields?.["embodied_carbon"] ?? -400,
          visualReference: record.fields?.["visual_reference"]?.[0]?.url,
        }
      })
    )
    .catch((err) => {
      console.warn(err)
      return Promise.resolve([])
    })

export const filterCompatibleModules =
  (ks: Array<keyof StructuredDna>) => (module: Module) =>
    filter((m: Module) =>
      ks.reduce(
        (acc: boolean, k) =>
          acc && m.structuredDna[k] === module.structuredDna[k],
        true
      )
    )
