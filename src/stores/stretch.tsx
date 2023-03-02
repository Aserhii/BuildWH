import { useBuildSystemsData } from "@/contexts/BuildSystemsData"
import { LoadedModule, Module } from "@/data/module"
import {
  filterRA,
  isMesh,
  mapO,
  mapRA,
  reduceRA,
  reduceWithIndexRA,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import {
  flatten,
  head,
  replicate,
  sort,
  spanLeft,
} from "fp-ts/lib/ReadonlyArray"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import { Ord as StrOrd } from "fp-ts/lib/string"
import produce from "immer"
import { useMemo, useState } from "react"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import {
  columnLayoutToDNA,
  PositionedModule,
  PositionedRow,
  useColumnLayout,
} from "../hooks/layouts"
import houses from "./houses"

type VanillaPositionedRow = PositionedRow & {
  geometry: BufferGeometry
  rowLength: number
}

const useGetVanillaModule = () => {
  const { modules: allModules } = useBuildSystemsData()
  return (module: LoadedModule): LoadedModule | null => {
    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    return pipe(
      systemModules,
      filterRA(
        (sysModule) =>
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType &&
          sysModule.structuredDna.levelType ===
            module.structuredDna.levelType &&
          sysModule.structuredDna.positionType === "MID"
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      mapO(loadModule),
      toNullable
    )
  }
}

export const useStretchedColumns = (
  buildingId: string,
  back: boolean = false
) => {
  const getVanillaModule = useGetVanillaModule()

  const columnLayout = useColumnLayout(buildingId)

  const house = houses[buildingId]

  // copy vanilla from me
  const endColumn = columnLayout[back ? columnLayout.length - 1 : 0]

  const [n, setN] = useState(0)

  const z0 = useMemo(
    () => (back ? endColumn.z : endColumn.gridGroups[0].modules[0].z),
    [columnLayout]
  )

  const positionedRows: readonly PositionedRow[] = pipe(
    endColumn.gridGroups,
    mapRA(({ levelIndex, levelType, y, modules }: PositionedRow) => ({
      levelIndex,
      levelType,
      y,
      modules: pipe(
        modules,
        reduceWithIndexRA(
          [],
          (
            i,
            positionedModules: PositionedModule[],
            { module: moduleIn }: PositionedModule
          ) => {
            const isFirst: boolean = i === 0

            const vanillaModuleOut = getVanillaModule(moduleIn)

            if (!vanillaModuleOut) throw new Error("No vanilla module")

            const z = isFirst
              ? vanillaModuleOut.length / 2
              : positionedModules[i - 1].z +
                positionedModules[i - 1].module.length / 2 +
                vanillaModuleOut.length / 2

            return [
              ...positionedModules,
              {
                module: vanillaModuleOut,
                z,
              },
            ]
          }
        )
      ),
    }))
  )

  const vanillaPositionedRows: readonly VanillaPositionedRow[] = pipe(
    positionedRows,
    mapRA(
      ({ modules, levelIndex, levelType, y }): VanillaPositionedRow => ({
        levelIndex,
        levelType,
        y,
        modules,
        geometry: pipe(
          modules,
          mapRA((module) => toReadonlyArray(module.module.gltf.nodes)),
          flatten,
          reduceRA([], (rowMeshes: Mesh[], [, node]) => {
            return produce(rowMeshes, (draft) => {
              node.traverse((child) => {
                if (isMesh(child)) {
                  draft.push(child)
                }
              })
            })
          }),
          (meshes) => {
            const geom = mergeBufferGeometries(
              meshes.map((mesh) => mesh.geometry)
            )
            if (!geom) throw new Error()
            return geom
          }
        ),
        rowLength: pipe(
          modules,
          reduceRA(0, (acc, v) => acc + v.module.length)
        ),
      })
    )
  )

  const columnLength = vanillaPositionedRows[0].rowLength

  const sendZ = (dz: number) => {
    // working for back but not front (changing floor to ceil doesn't work)
    const x = Math.floor(Math.abs(z0 - dz) / columnLength)
    const next = back ? x : x - 1
    if (next !== n) setN(next)
  }

  // need to calc totalLength
  // also one-off issue
  // before after

  const sendLast = () => {
    const realN = back ? n - 1 : n
    const dna = pipe(
      columnLayout,
      spanLeft(
        ({ columnIndex }) =>
          columnIndex !== (back ? columnLayout.length - 1 : 1)
      ),
      ({ init, rest }) => [
        ...init,
        ...replicate(realN, {
          columnIndex: 0,
          gridGroups: positionedRows,
          z: 0,
        }),
        ...rest,
      ],
      columnLayoutToDNA
    ) as string[]
    // let position = house.position
    // if (!back) {
    //   position[1] -= columnLength * realN
    // }
    houses[buildingId] = {
      ...house,
      dna,
      position: back
        ? house.position
        : [house.position[0], house.position[1] - columnLength * realN],
    }
    setN(0)
  }

  return { sendZ, sendLast, vanillaPositionedRows, n, z0 } as const
}
