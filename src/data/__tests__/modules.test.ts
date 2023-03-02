import {
  moduleLayout,
  extendLast,
  shrinkLast,
  StructuredDna,
} from "../moduleLayout"
import type { Module } from "../module"
import { parseDna } from "../moduleLayout"

test("parseSequence", () => {
  expect(parseDna("W1-END-F1-GRID1-1-ST0-L0-SIDE0-SIDE0-END0-TOP0")).toEqual({
    sectionType: "W1",
    positionType: "END",
    levelType: "F1",
    level: 0,
    gridType: "GRID1",
    gridUnits: 1,
    stairsType: "ST0",
    internalLayoutType: "L0",
    windowTypeSide1: "SIDE0",
    windowTypeSide2: "SIDE0",
    windowTypeEnd: "END0",
    windowTypeTop: "TOP0",
  } as StructuredDna)
})

// Test sample
export const exampleModules: Array<Module> = [
  // Cell 1
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-G",
    structuredDna: {
      level: 0,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.2,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-M",
    structuredDna: {
      level: 1,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 1.2,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-R",
    structuredDna: {
      level: 2,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.6,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
  // Cell 2
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-M-G",
    structuredDna: {
      level: 0,
      levelType: "",
      positionType: "MID",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.2,
    length: 2,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-M-M",
    structuredDna: {
      level: 1,
      levelType: "",
      positionType: "MID",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 1.2,
    length: 2,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-M-R",
    structuredDna: {
      level: 2,
      levelType: "",
      positionType: "MID",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.6,
    length: 2,
    cost: 0,
    embodiedCarbon: 0,
  },
  // Cell 3
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-G",
    structuredDna: {
      level: 0,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.2,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-M",
    structuredDna: {
      level: 1,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 1.2,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
  {
    id: "mod-1",
    systemId: "system",
    dna: "00-E-R",
    structuredDna: {
      level: 2,
      levelType: "",
      positionType: "END",
      sectionType: "",
      gridType: "",
      gridUnits: 1,
      stairsType: "",
      internalLayoutType: "",
      windowTypeSide1: "",
      windowTypeSide2: "",
      windowTypeEnd: "",
      windowTypeTop: "",
    },
    modelUrl: "",
    width: 2,
    height: 0.6,
    length: 1,
    cost: 0,
    embodiedCarbon: 0,
  },
]

test("moduleLayout", () => {
  expect(moduleLayout(exampleModules)).toEqual({
    modules: [
      // Cell 1
      { position: [0, 0, -1.5], grid: [0, 0], dna: "00-E-G" },
      { position: [0, 0.2, -1.5], grid: [0, 1], dna: "00-E-M" },
      {
        position: [0, 1.4, -1.5],
        grid: [0, 2],
        dna: "00-E-R",
      },
      // Cell 2
      { position: [0, 0, 0], grid: [1, 0], dna: "00-M-G" },
      { position: [0, 0.2, 0], grid: [1, 1], dna: "00-M-M" },
      {
        position: [0, 1.4, 0],
        grid: [1, 2],
        dna: "00-M-R",
      },
      // Cell 3
      { position: [0, 0, 1.5], grid: [2, 0], dna: "00-E-G" },
      { position: [0, 0.2, 1.5], grid: [2, 1], dna: "00-E-M" },
      {
        position: [0, 1.4, 1.5],
        grid: [2, 2],
        dna: "00-E-R",
      },
    ],
    gridBounds: [2, 2],
    totalLength: 4,
    cellLengths: [1, 2, 1],
    cellWidths: [2, 2, 2],
    cellHeights: [0.2, 1.2, 0.6],
    cellVanillaModules: {
      dnas: ["00-M-G", "00-M-M", "00-M-R"],
      length: 2,
    },
  })
})

describe("extendLast", () => {
  test("extend by a little over one vanilla module", () => {
    expect(extendLast(2.05, moduleLayout(exampleModules))).toEqual({
      dnas: [
        "00-E-G",
        "00-E-M",
        "00-E-R",
        "00-M-G",
        "00-M-M",
        "00-M-R",
        // New modules
        "00-M-G",
        "00-M-M",
        "00-M-R",
        // End new modules
        "00-E-G",
        "00-E-M",
        "00-E-R",
      ],
      totalLength: 6,
    })
  })
})

describe("shrinkLast", () => {
  test("shrink when no longer shrinkable", () => {
    expect(shrinkLast(0.1, moduleLayout(exampleModules))).toEqual({
      dnas: [
        "00-E-G",
        "00-E-M",
        "00-E-R",
        "00-M-G",
        "00-M-M",
        "00-M-R",
        "00-E-G",
        "00-E-M",
        "00-E-R",
      ],
      totalLength: 4,
    })
  })

  test("shrink by a lot when no longer shrinkable", () => {
    expect(shrinkLast(10000, moduleLayout(exampleModules))).toEqual({
      dnas: [
        "00-E-G",
        "00-E-M",
        "00-E-R",
        "00-M-G",
        "00-M-M",
        "00-M-R",
        "00-E-G",
        "00-E-M",
        "00-E-R",
      ],
      totalLength: 4,
    })
  })
})

export {}
