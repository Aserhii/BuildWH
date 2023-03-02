import { useSystemSettings } from "@/data/settings"
import houses, { useHouse } from "@/stores/houses"
import { clamp, isMesh, mapRA, reduceRA, reduceWithIndexRA } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { flatten, partition, replicate } from "fp-ts/lib/ReadonlyArray"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import { proxy } from "valtio"
import {
  columnLayoutToDNA,
  PositionedColumn,
  PositionedModule,
  PositionedRow,
  useColumnLayout,
} from "./layouts"
import { useGetLoadedVanillaModule } from "./modules"

export const stretch = proxy({
  endVanillaColumns: 0,
  startVanillaColumns: 0,
  visibleStartIndex: -1,
  visibleEndIndex: -1,
})

export type VanillaPositionedRow = PositionedRow & {
  geometry: BufferGeometry
}

const getColumnLength = (column: PositionedColumn) =>
  column.gridGroups[0].modules.reduce((acc, v) => acc + v.module.length, 0)

const getColumnsLength = flow(
  reduceRA(0, (acc, v: PositionedColumn) => acc + getColumnLength(v))
)

export const useVanillaPositionedRows = (
  gridGroups: readonly PositionedRow[]
) => {
  const getVanillaModule = useGetLoadedVanillaModule()
  return pipe(
    gridGroups,
    mapRA(({ levelIndex, levelType, y, modules: modulesIn }: PositionedRow) => {
      const modules = pipe(
        modulesIn,
        reduceWithIndexRA(
          [],
          (
            i,
            positionedModules: PositionedModule[],
            { module: moduleIn }: PositionedModule
          ) => {
            const isFirst: boolean = i === 0

            const vanillaModuleOut = getVanillaModule(moduleIn, {
              positionType: "MID",
            })

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
      )
      return {
        levelIndex,
        levelType,
        y,
        modules,
        length: modules.reduce((acc, v) => acc + v.module.length, 0),
      }
    }),
    mapRA(
      ({
        modules,
        levelIndex,
        levelType,
        y,
        length,
      }): VanillaPositionedRow => ({
        levelIndex,
        levelType,
        y,
        length,
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
      })
    )
  )
}

export const useStretch = (buildingId: string) => {
  const columnLayout = useColumnLayout(buildingId)

  const house = useHouse(buildingId)

  const { startColumn, endColumn, midColumns } = pipe(
    columnLayout,
    partition(
      ({ columnIndex }) =>
        columnIndex === 0 || columnIndex === columnLayout.length - 1
    ),
    ({ left: midColumns, right: [startColumn, endColumn] }) => ({
      startColumn,
      endColumn,
      midColumns,
    })
  )

  if (stretch.visibleStartIndex === -1 && stretch.visibleEndIndex === -1) {
    stretch.visibleStartIndex = startColumn.columnIndex
    stretch.visibleEndIndex = endColumn.columnIndex
  }

  const vanillaPositionedRows = useVanillaPositionedRows(startColumn.gridGroups)

  const vanillaColumnLength = vanillaPositionedRows[0].length

  const totalLength = getColumnsLength(columnLayout)

  const midRiffLength = getColumnsLength(midColumns)

  const {
    length: { max: maxLength },
  } = useSystemSettings(house.systemId)

  const startClamp = clamp(
    -(maxLength - totalLength),
    midRiffLength - vanillaColumnLength
  )

  const endClamp = clamp(
    -midRiffLength + vanillaColumnLength,
    maxLength - totalLength
  )

  const columnZsUp = columnLayout.map((x) => x.z)
  const columnZsDown = columnLayout
    .map(({ z, columnIndex }) => ({ target: totalLength - z, columnIndex }))
    .reverse()

  const sendDrag = (
    z: number,
    { isStart }: { isStart: boolean } = { isStart: true }
  ) => {
    if (isStart) {
      if (z < 0) {
        const nextVanillaLength = Math.ceil(-z / vanillaColumnLength)
        if (nextVanillaLength !== stretch.startVanillaColumns) {
          stretch.startVanillaColumns = nextVanillaLength
        }
      } else if (z > 0) {
        stretch.startVanillaColumns = 0
        const visibleStartIndex = columnZsUp.findIndex((columnZ) => columnZ > z)
        if (stretch.visibleStartIndex !== visibleStartIndex) {
          stretch.visibleStartIndex = visibleStartIndex
        }
      }
    } else if (!isStart) {
      if (z > 0) {
        const nextVanillaLength = Math.ceil(z / vanillaColumnLength)
        if (nextVanillaLength !== stretch.startVanillaColumns) {
          stretch.endVanillaColumns = nextVanillaLength
        }
      } else if (z < 0) {
        stretch.endVanillaColumns = 0
        const result = columnZsDown.find((x) => -z < x.target)
        if (result) {
          stretch.visibleEndIndex = result.columnIndex - 1
        }
      }
    }
  }

  const sendDrop = () => {
    // update the DNA depending on...
    // endVanillaColumns
    // which end (isStart)

    const {
      startVanillaColumns,
      endVanillaColumns,
      visibleStartIndex,
      visibleEndIndex,
    } = stretch

    if (startVanillaColumns > 0 || endVanillaColumns > 0) {
      houses[house.id].dna = columnLayoutToDNA([
        startColumn,
        ...replicate(startVanillaColumns, {
          gridGroups: vanillaPositionedRows,
        }),
        ...midColumns,
        ...replicate(endVanillaColumns, {
          gridGroups: vanillaPositionedRows,
        }),
        endColumn,
      ]) as string[]
    } else if (
      visibleStartIndex > 0 ||
      visibleEndIndex < columnLayout.length - 1
    ) {
      houses[house.id].dna = columnLayoutToDNA([
        startColumn,
        ...midColumns.slice(visibleStartIndex, visibleEndIndex),
        endColumn,
      ]) as string[]
    }

    // const realN = pipe(
    //   columnLayout,
    //   spanLeft(
    //     ({ columnIndex }) =>
    //       columnIndex !== (isStart ? columnLayout.length - 1 : 1)
    //   ),
    //   ({ init, rest }) => [
    //     ...init,
    //     ...replicate(realN, {
    //       columnIndex: 0,
    //       gridGroups: positionedRows,
    //       z: 0,
    //     }),
    //     ...rest,
    //   ]
    // )
    // // add some vanilla
    // if (stretch.endVanillaColumns > 0) {
    //   // start
    //     // end
    //   } else {
    //   }
    //   // subtract from start
    // } else if (stretch.visibleStartIndex > startColumn.columnIndex) {
    //   // subtract from end
    // } else if (stretch.visibleEndIndex < endColumn.columnIndex) {
    // }

    // reset
    stretch.visibleStartIndex = -1
    stretch.visibleEndIndex = -1
    stretch.endVanillaColumns = 0
    stretch.startVanillaColumns = 0
  }

  return {
    startColumn,
    endColumn,
    midColumns,
    columnLayout,
    startClamp,
    endClamp,
    sendDrag,
    sendDrop,
    vanillaPositionedRows,
  }
}

// const realN = back ? n - 1 : n
// const dna = pipe(
//   columnLayout,
//   spanLeft(
//     ({ columnIndex }) =>
//       columnIndex !== (back ? columnLayout.length - 1 : 1)
//   ),
//   ({ init, rest }) => [
//     ...init,
//     ...replicate(realN, {
//       columnIndex: 0,
//       gridGroups: positionedRows,
//       z: 0,
//     }),
//     ...rest,
//   ],
//   columnLayoutToDNA
// ) as string[]

// let position = house.position
// if (!back) {
//   position[1] -= columnLength * realN
// }

// houses[buildingId] = {
//   ...house,
//   dna,
//   position: back
//     ? house.position
//     : [house.position[0], house.position[1] - columnLength * realN],
// }
// setN(0)
