import type { System } from "@/data/system"
import { abs, GltfT, hamming, mapA } from "@/utils"
import { sum } from "fp-ts-std/Array"
import { values } from "fp-ts-std/Record"
import { filter, Foldable, sort, sortBy, takeLeft } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { Ord } from "fp-ts/lib/number"
import { contramap, fromCompare } from "fp-ts/lib/Ord"
import { sign } from "fp-ts/lib/Ordering"
import { fromFoldable } from "fp-ts/lib/Record"
import { first } from "fp-ts/lib/Semigroup"
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

export type StructuredDnaModule = Pick<Module, "structuredDna">

export type BareModule = Omit<Module, "modelUrl">

export type LoadedModule = BareModule & {
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
  (ks: Array<keyof StructuredDna>) => (module: BareModule) =>
    filter((m: BareModule) =>
      ks.reduce(
        (acc: boolean, k) =>
          acc && m.structuredDna[k] === module.structuredDna[k],
        true
      )
    )

export const keysFilter =
  <M extends BareModule>(ks: Array<keyof StructuredDna>, targetModule: M) =>
  (m: M) =>
    ks.reduce(
      (acc: boolean, k) =>
        acc && m.structuredDna[k] === targetModule.structuredDna[k],
      true
    )

export const keysHamming =
  (ks: Array<keyof StructuredDna>) =>
  <M extends StructuredDnaModule>(a: M, b: M) =>
    pipe(
      ks,
      mapA((k): [string, number] => {
        switch (typeof a.structuredDna[k]) {
          case "string":
            return [
              k,
              hamming(
                a.structuredDna[k] as string,
                b.structuredDna[k] as string
              ),
            ]
          case "number":
            return [
              k,
              abs(
                (a.structuredDna[k] as number) - (b.structuredDna[k] as number)
              ),
            ]
          default:
            throw new Error(
              `structuredDna key ${k} type ${typeof a.structuredDna[k]} `
            )
        }
      }),
      fromFoldable(first<number>(), Foldable)
    )

export const keysHammingTotal =
  (ks: Array<keyof StructuredDna>) =>
  <M extends StructuredDnaModule>(a: M, b: M) =>
    pipe(keysHamming(ks)(a, b), values, sum)

export const candidatesByHamming = <M extends StructuredDnaModule>(
  ks: Array<keyof StructuredDna>,
  targetModule: M,
  candidateModules: M[]
) =>
  pipe(
    candidateModules,
    mapA((m): [M, number] => [m, keysHammingTotal(ks)(targetModule, m)]),
    sort(
      pipe(
        Ord,
        contramap(([m, n]: [M, number]) => n)
      )
    ),
    ([[m]]) => m
  )

export const keysHammingSort = <M extends BareModule>(
  ks: Array<keyof StructuredDna>,
  targetModule: M
) =>
  sortBy(
    pipe(
      ks,
      mapA((k) => {
        const ham = (x: string | number) => {
          const foo =
            typeof x === "string"
              ? hamming(x, targetModule.structuredDna[k] as string)
              : x - (targetModule.structuredDna[k] as number)

          return foo
        }

        return fromCompare((first: M, second: M) => {
          return sign(
            ham(first.structuredDna[k]) - ham(second.structuredDna[k])
          )
        })
      })
    )
  )
