import { filter, map } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { map as mapR, toArray } from "fp-ts/lib/Record"
import { drop, flatten, last, mapAccum, range, repeat, slice } from "ramda"
import type { LoadedGltfModule, Module } from "../data/module"

export interface StructuredDna {
  level: number
  levelType: string
  positionType: "END" | "MID"
  sectionType: string
  gridType: string
  gridUnits: number
  stairsType: string
  internalLayoutType: string
  windowTypeSide1: string
  windowTypeSide2: string
  windowTypeEnd: string
  windowTypeTop: string
}

export const parseDna = (dna: string): StructuredDna => {
  const chunks = dna.split("-")
  const levelType = chunks[2]
  const levelLetter = chunks[2]?.[0]
  const typeLetter = chunks[1]?.[0]?.toUpperCase()
  const sectionType = chunks[0] ?? "S1"
  const gridType = chunks[3] ?? "GRID1"
  const gridUnits = Number(chunks[4]) ?? 1
  const stairsType = chunks[5] ?? "ST0"
  const internalLayoutType = chunks[6] ?? "L0"
  const windowTypeSide1 = chunks[7] ?? "SIDE0"
  const windowTypeSide2 = chunks[8] ?? "SIDE0"
  const windowTypeEnd = chunks[9] ?? "END0"
  const windowTypeTop = chunks[10] ?? "TOP0"

  return {
    positionType: typeLetter === "E" ? "END" : "MID",
    level: ["F", "G", "M", "T", "R"].indexOf(levelLetter),
    levelType,
    sectionType,
    gridType,
    gridUnits,
    stairsType,
    internalLayoutType,
    windowTypeSide1,
    windowTypeSide2,
    windowTypeEnd,
    windowTypeTop,
  }
}

export const isDnaCompatible = (
  structuredDna1: StructuredDna,
  structuredDna2: StructuredDna
): boolean => {
  return (
    structuredDna1.levelType === structuredDna2.levelType &&
    structuredDna1.positionType === structuredDna2.positionType &&
    structuredDna1.sectionType === structuredDna2.sectionType &&
    structuredDna1.gridType === structuredDna2.gridType
  )
}

interface ModuleLayoutContext {
  prevModule: Module | undefined
  prevPosition: Pt3
  prevGrid: Pt2
  lengthRunningTotal: number
  cellLengths: Array<number>
  cellWidths: Array<number>
  // Example: { "0": 0.2, "1": 0.3 }
  cellHeights: Record<string, number>
  gridBounds: Pt2
  index: number
}

export interface ModuleLayoutItem {
  dna: string
  position: Pt3
  grid: Pt2
}

export interface ModuleLayout {
  modules: Array<ModuleLayoutItem>
  gridBounds: Pt2
  totalLength: number
  cellVanillaModules?: Readonly<{ dnas: Array<string>; length: number }>
  cellLengths: Array<number>
  cellWidths: Array<number>
  cellHeights: Array<number>
}

/**
 * Takes a list of modules and calculates at what position each of them will be
 * placed inside a building. This uses a runtime heuristic where a module goes on top
 * of the previous one (at a height incremented by the height of said previous module)
 * or back onto ground level if the e.g. the previous module was a roof module and the
 * next one was a foundation.
 */
export const moduleLayout = (
  modules: Readonly<Array<Module>>
): ModuleLayout => {
  const [context, positions] = mapAccum<
    Module,
    ModuleLayoutContext,
    ModuleLayoutItem
  >(
    (context, module) => {
      const [x, y, z] = context.prevPosition

      const horizontalOffset =
        module && context.prevModule
          ? module.length / 2 + context.prevModule.length / 2
          : 0

      const verticalOffset =
        module && context.prevModule ? context.prevModule.height : 0

      const jump =
        !context.prevModule ||
        module.structuredDna.level < context.prevModule.structuredDna.level

      const gap = 0

      const [newZ, newY] = jump
        ? [z + gap + horizontalOffset, 0]
        : [z, y + gap + verticalOffset]

      const newPosition: Pt3 = [x, newY, newZ]

      const [gridHorizontal, gridVertical] = context.prevGrid

      const newGrid: [number, number] = jump
        ? [gridHorizontal + (!context.prevModule ? 0 : 1), 0]
        : [gridHorizontal, gridVertical + 1]

      const newMaxGrid: Pt2 = [
        Math.max(context.gridBounds[0], newGrid[0]),
        Math.max(context.gridBounds[1], newGrid[1]),
      ]

      // Record cell height in a dictionary by vertical grid position
      const newCellHeights = module
        ? { ...context.cellHeights, [newGrid[1]]: module.height }
        : context.cellHeights

      return [
        {
          prevModule: module,
          prevPosition: newPosition,
          prevGrid: newGrid,
          lengthRunningTotal: newZ,
          index: context.index + 1,
          gridBounds: newMaxGrid,
          cellHeights: newCellHeights,
          cellLengths: [
            ...context.cellLengths,
            ...(jump || !context.prevModule ? [module.length || 0] : []),
          ],
          cellWidths: [
            ...context.cellWidths,
            ...(jump || !context.prevModule ? [module.width || 0] : []),
          ],
        },
        { position: newPosition, grid: newGrid, dna: module.dna },
      ]
    },
    {
      prevModule: undefined,
      prevGrid: [0, 0],
      prevPosition: [0, 0, 0],
      lengthRunningTotal: 0,
      cellLengths: [],
      cellWidths: [],
      cellHeights: {},
      gridBounds: [0, 0],
      index: 0,
    },
    modules
  )

  const firstLength = context.cellLengths[0] || 0
  const lastLength = last(context.cellLengths) || 0

  const centered: Array<{
    dna: string
    position: Pt3
    grid: Pt2
  }> = positions.map((item) => {
    const [x, y, z] = item.position
    const diff =
      (context.lengthRunningTotal + firstLength / 2 + lastLength / 2) / 2 -
      firstLength / 2
    return { ...item, position: [x, y, z - diff] }
  })

  // Figure out vanilla modules

  /**
   * Example: { 2: { 0: ["M1", "M2"] } } means 'among modules of length 2, on vertical
   * level 0 there are two modules "M1" and "M2" that are candidates to become vanilla
   * modules.
   */
  let vanillaCandidatesByLength: Record<
    string,
    Record<string, Array<string>>
  > = {}

  // Build up vanilla candidates
  centered.forEach(({ grid }, index) => {
    const module = modules[index]
    if (module.structuredDna.positionType === "END") {
      return
    }
    vanillaCandidatesByLength = {
      ...vanillaCandidatesByLength,
      [module.length]: {
        ...(vanillaCandidatesByLength[module.length] || {}),
        [grid[1]]: [
          ...(vanillaCandidatesByLength[module.length]?.[grid[1]] || []),
          module.dna,
        ],
      },
    }
  })

  const vanillaModules = pipe(
    vanillaCandidatesByLength,
    mapR((obj) =>
      pipe(
        range(0, context.gridBounds[1] + 1),
        map((i) => obj[i]?.[0]),
        (x) => x,
        filter(Boolean)
      )
    ),
    toArray
  )[0]

  // vanillaModules[0][0]

  // Sort and filter out vanilla modules
  // const vanillaModules: [string, Array<string>] | undefined = compose(
  //   filter(([_key, value]) => Boolean(value)),
  //   toPairs,
  //   mapObjIndexed(
  //     (value: Record<string, Array<string>>): Array<string> | null => {
  //       const firsts = range(0, context.gridBounds[1] + 1).map(
  //         (index) => value[index]?.[0]
  //       )
  //       if (all((val) => Boolean(val), firsts)) {
  //         return firsts
  //       }
  //       return null
  //     }
  //   )
  // )(vanillaCandidatesByLength)[0]

  // End vanilla modules

  return {
    modules: centered,
    gridBounds: context.gridBounds,
    totalLength: context.lengthRunningTotal + (firstLength + lastLength) / 2,
    cellLengths: context.cellLengths,
    cellWidths: context.cellWidths,
    cellHeights: range(0, context.gridBounds[1] + 1).map(
      (gridPosition) => context.cellHeights[gridPosition] || 0
    ),
    cellVanillaModules: vanillaModules
      ? { dnas: vanillaModules[1], length: Number(vanillaModules[0]) }
      : undefined,
  }
}

export const extendFirst = (
  distance: number,
  layout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  if (distance < 0.01) {
    return null
  }
  const { cellVanillaModules } = layout
  if (!cellVanillaModules) {
    return null
  }
  const firstModules = layout.modules
    .filter((layoutModule) => {
      const [gridH, _gridV] = layoutModule.grid
      return gridH === 0
    })
    .map((layoutModule) => layoutModule.dna)
  const stretchUnitLength = cellVanillaModules.length
  const unitCount = Math.floor(distance / stretchUnitLength)
  const afterFirstModules = drop(firstModules.length, layout.modules).map(
    (module) => module.dna
  )
  return {
    dnas: [
      ...firstModules,
      ...flatten(repeat(cellVanillaModules.dnas || [], unitCount)),
      ...afterFirstModules,
    ],
    totalLength: layout.totalLength + unitCount * stretchUnitLength,
  }
}

export const shrinkFirst = (
  distance: number,
  moduleLayout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  const cellCount = moduleLayout.cellLengths.length
  let cellIndex = 1
  let distanceRemaining: number = distance
  while (distanceRemaining > 0 && cellIndex < cellCount - 2) {
    distanceRemaining = distanceRemaining - moduleLayout.cellLengths[cellIndex]
    cellIndex = cellIndex + 1
  }
  return {
    dnas: moduleLayout.modules
      .map((module) =>
        module.grid[0] === 0 || module.grid[0] >= cellIndex ? module.dna : null
      )
      .filter((val): val is string => Boolean(val)),
    totalLength: moduleLayout.totalLength - distance + distanceRemaining,
  }
}

export const extendOrShrinkFirst = (
  distance: number,
  moduleLayout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  if (distance > 0) {
    return extendFirst(distance, moduleLayout)
  }
  return shrinkFirst(Math.abs(distance), moduleLayout)
}

export const extendLast = (
  distance: number,
  layout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  if (distance < 0.01) {
    return null
  }
  const { cellVanillaModules } = layout
  if (!cellVanillaModules) {
    return null
  }
  const lastModules = layout.modules
    .filter((layoutModule) => {
      const [gridH, _gridV] = layoutModule.grid
      const [gridHBounds, _gridVBounds] = layout.gridBounds
      return gridH === gridHBounds
    })
    .map((layoutModule) => layoutModule.dna)
  const stretchUnitLength = cellVanillaModules.length
  const unitCount = Math.floor(distance / stretchUnitLength)
  const beforeLastModules = slice(0, -lastModules.length, layout.modules).map(
    (module) => module.dna
  )
  return {
    dnas: [
      ...beforeLastModules,
      ...flatten(repeat(cellVanillaModules.dnas || [], unitCount)),
      ...lastModules,
    ],
    totalLength: layout.totalLength + unitCount * stretchUnitLength,
  }
}

export const shrinkLast = (
  distance: number,
  moduleLayout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  const cellCount = moduleLayout.cellLengths.length
  let cellIndex = cellCount - 2
  let distanceRemaining: number = distance
  while (distanceRemaining > 0 && cellIndex > 1) {
    distanceRemaining = distanceRemaining - moduleLayout.cellLengths[cellIndex]
    cellIndex = cellIndex - 1
  }
  return {
    dnas: moduleLayout.modules
      .map((module) =>
        module.grid[0] === cellCount - 1 || module.grid[0] <= cellIndex
          ? module.dna
          : null
      )
      .filter((val): val is string => Boolean(val)),
    totalLength: moduleLayout.totalLength - distance + distanceRemaining,
  }
}

export const extendOrShrinkLast = (
  distance: number,
  moduleLayout: ModuleLayout
): null | { dnas: Array<string>; totalLength: number } => {
  if (distance > 0) {
    return extendLast(distance, moduleLayout)
  }
  return shrinkLast(Math.abs(distance), moduleLayout)
}
