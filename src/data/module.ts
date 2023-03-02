import type { System } from "@/data/system"
import { ColumnLayout, columnLayoutToDNA } from "@/hooks/layouts"
import { useGetVanillaModule } from "@/hooks/modules"
import { abs, filterA, GltfT, hamming, mapA, mapO } from "@/utils"
import { sum } from "fp-ts-std/Array"
import { values } from "fp-ts-std/Record"
import {
  filter,
  Foldable,
  head,
  replicate,
  sort,
  sortBy,
} from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { range } from "fp-ts/lib/NonEmptyArray"
import { Ord } from "fp-ts/lib/number"
import { toNullable } from "fp-ts/lib/Option"
import { contramap, fromCompare } from "fp-ts/lib/Ord"
import { sign } from "fp-ts/lib/Ordering"
import { fromFoldable } from "fp-ts/lib/Record"
import { first } from "fp-ts/lib/Semigroup"
import produce from "immer"
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
  floorArea: number
  claddingArea: number
  liningArea: number
  roofingArea: number
  spaceType?: string
  embodiedCarbon: number // kgCO2
  visualReference?: string
  description?: string
}

export type StructuredDnaModule = Pick<Module, "structuredDna">

export type BareModule = Omit<Module, "modelUrl">

export type LoadedModule = BareModule & {
  gltf: GltfT
}

export const getModules = async (system: System): Promise<Array<Module>> => {
  try {
    const moduleRecords = await getAirtableEntries({
      tableId: system.airtableId,
      tab: "modules",
    })

    return moduleRecords.records.map((record: any) => {
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
        floorArea: record.fields?.["floor_area"] ?? 0,
        claddingArea: record.fields?.["floor_area"] ?? 0,
        liningArea: record.fields?.["floor_area"] ?? 0,
        roofingArea: record.fields?.["roofing_area"] ?? 0,
        spaceType: record.fields?.["space_type"]?.[0],
        cost: record.fields?.["baseline_module_cost"] ?? 1500,
        embodiedCarbon: record.fields?.["embodied_carbon"] ?? -400,
        visualReference: record.fields?.["visual_reference"]?.[0]?.url,
        description: record.fields?.["description"],
      }
    })
  } catch (err) {
    console.warn(err)
    return []
  }
}

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
  <M extends StructuredDnaModule>(
    ks: Array<keyof StructuredDna>,
    targetModule: M
  ) =>
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

export const topCandidateByHamming = <M extends StructuredDnaModule>(
  ks: Array<keyof StructuredDna>,
  targetModule: M,
  candidateModules: M[]
): M | null =>
  pipe(
    candidateModules,
    mapA((m): [M, number] => [m, keysHammingTotal(ks)(targetModule, m)]),
    sort(
      pipe(
        Ord,
        contramap(([, n]: [M, number]) => n)
      )
    ),
    head,
    mapO(([m]) => m),
    toNullable
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

export type ColumnModuleKey = {
  columnIndex: number
  levelIndex: number
  groupIndex: number
}

export const useChangeModuleLayout = <T extends BareModule>(
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
) => {
  const getVanillaModule = useGetVanillaModule()

  const oldModule =
    columnLayout[columnIndex].gridGroups[levelIndex].modules[groupIndex].module

  return (newModule: T): string[] => {
    const gridUnitDiff =
      newModule.structuredDna.gridUnits - oldModule.structuredDna.gridUnits

    const { sign } = Math

    const roofIndex = columnLayout[columnIndex].gridGroups.length - 1

    switch (true) {
      case sign(gridUnitDiff) < 0:
        // old module was bigger
        // for this level index vanilla the gridUnitDiff
        return pipe(
          columnLayout,
          produce((draft: ColumnLayout) => {
            draft[columnIndex].gridGroups[levelIndex].modules[
              groupIndex
            ].module.dna = newModule.dna
            draft[columnIndex].gridGroups[levelIndex].modules = [
              ...draft[columnIndex].gridGroups[levelIndex].modules,
              ...pipe(
                replicate(-gridUnitDiff, getVanillaModule(newModule)),
                mapA((module) => ({ module, z: 0 } as any))
              ),
            ]
          }),
          columnLayoutToDNA
        ) as string[]

      case sign(gridUnitDiff) > 0:
        // new module is bigger
        // for this level vanilla all other levels
        return pipe(
          columnLayout,
          produce((draft) => {
            draft[columnIndex].gridGroups[levelIndex].modules[
              groupIndex
            ].module.dna = newModule.dna
            pipe(
              range(0, roofIndex),
              filterA((x) => x !== levelIndex)
            ).forEach((i) => {
              const vanillaModule = getVanillaModule(
                columnLayout[columnIndex].gridGroups[i].modules[0].module
              )
              draft[columnIndex].gridGroups[i].modules = [
                ...draft[columnIndex].gridGroups[i].modules,
                ...pipe(
                  replicate(
                    gridUnitDiff / vanillaModule.structuredDna.gridUnits,
                    vanillaModule
                  ),
                  mapA((module) => ({ module, z: 0 }))
                ),
              ]
            })
          }),
          columnLayoutToDNA
        )

      case sign(gridUnitDiff) === 0:
      default:
        // just swap the module
        return pipe(
          columnLayout,
          produce((draft) => {
            draft[columnIndex].gridGroups[levelIndex].modules[
              groupIndex
            ].module.dna = newModule.dna
          }),
          columnLayoutToDNA
        ) as string[]
    }
  }
}
