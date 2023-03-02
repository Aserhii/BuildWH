import { transpose } from "fp-ts-std/ReadonlyArray"
import { flow, pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import {
  chunksOf,
  dropRight,
  findIndex,
  flatten,
  map,
  mapWithIndex,
  scanLeft,
  zip,
} from "fp-ts/lib/ReadonlyArray"
import type { Module } from "./module"

type LayoutInfo = {
  indices: [number, number, number]
  position: [number, number, number]
  scale: [number, number, number]
}

const prevify = <T extends unknown>(ts: readonly T[]) =>
  zip(ts, [null, ...dropRight(1)(ts)])

export const getPositions = (
  modules: Readonly<Array<Module>>
): readonly LayoutInfo[] => {
  const chunkIndex = pipe(
    modules,
    prevify,
    findIndex(
      ([x, y]) => x.structuredDna.level < (y?.structuredDna.level ?? 0)
    ),
    getOrElse(() => 0)
  )

  const yChunks = chunksOf(chunkIndex)(modules)

  const zChunks = transpose(yChunks)

  const positionsFunc = (k: "height" | "length") =>
    flow(
      map(
        flow(
          scanLeft(0, (acc, module: Module) => acc + module[k]),
          dropRight(1)
        )
      )
    )

  const zPositions = positionsFunc("length")(zChunks)

  const yPositions = positionsFunc("height")(yChunks)

  return pipe(
    zip(yPositions, transpose(zPositions)),
    map(([a, b]) => zip(b)(a)),
    mapWithIndex((lengthIndex, chunk) =>
      pipe(
        chunk,
        mapWithIndex((heightIndex, [y, z0]): LayoutInfo => {
          const moduleIndex = lengthIndex * chunk.length + heightIndex
          const module = modules[moduleIndex]
          const mirror = lengthIndex === 0
          const z1 = !mirror
            ? z0 + module.length / 2
            : z0 + (-module.length + module.length / 2)

          return {
            position: [0, y, z1],
            indices: [0, heightIndex, lengthIndex],
            scale: mirror ? [1, 1, -1] : [1, 1, 1],
          }
        })
      )
    ),
    flatten
  )
}
