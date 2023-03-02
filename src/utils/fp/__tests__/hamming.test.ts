import {
  BareModule,
  keysHamming,
  keysHammingSort,
  keysHammingTotal,
  StructuredDnaModule,
} from "@/data/module"
import { parseDna } from "@/data/moduleLayout"
import { hamming } from ".."

const m1: StructuredDnaModule = {
  structuredDna: parseDna("W1-MID-T1-GRID2-7-ST2-L2-SIDE2-SIDE0-END0-TOP0"),
}
const m2: StructuredDnaModule = {
  structuredDna: parseDna("W1-MID-T1-GRID2-7-ST2-L3-SIDE0-SIDE0-END0-TOP0"),
}

describe("hamming", () => {
  test("basic", () => {
    expect(hamming("abc", "abd")).toEqual(1)
  })

  test("with modules", () => {
    const ham = keysHamming(["internalLayoutType", "windowTypeSide1"])

    expect(ham(m1, m2)).toEqual(
      expect.objectContaining({ internalLayoutType: 1, windowTypeSide1: 2 })
    )
  })

  test("total", () => {
    expect(
      keysHammingTotal(["internalLayoutType", "windowTypeSide1"])(m1, m2)
    ).toEqual(3)
  })
})

export {}
