import { mapWithIndexA, reduceRA, reduceWithIndexA, zipRA } from "@/utils"
import { transpose } from "fp-ts-std/Array"
import { pipe } from "fp-ts/lib/function"

const analyzeColumn = reduceWithIndexA(
  { legit: true, target: -1, rows: [] },
  (
    index,
    {
      rows,
      legit,
      target,
    }: {
      rows: { units: number; index: number }[]
      legit: boolean
      target: number
    },
    row: number[]
  ) => {
    const units = row.reduce((acc, v) => acc + v, 0)
    return {
      rows: [...rows, { units, index }],
      legit: legit && (target === -1 || target === units),
      target: target === -1 ? units : Math.max(target, units),
    }
  }
)

const columnify = (input: number[][]): number[][][] => {
  let slices = new Array<[number, number]>(input.length).fill([0, 1])
  const lengths = input.map((v) => v.length)

  let acc: number[][][] = []

  const slicesRemaining = () =>
    !pipe(
      zipRA(slices)(lengths),
      reduceRA(true, (acc, [length, [start]]) => acc && start > length - 1)
    )

  while (slicesRemaining()) {
    pipe(
      slices,
      mapWithIndexA((rowIndex, [start, end]) =>
        input[rowIndex].slice(start, end)
      ),
      (column) =>
        pipe(column, analyzeColumn, ({ rows, legit, target }) => {
          if (legit) {
            acc = [...acc, column]
            slices = slices.map(([, end]) => [end, end + 1])
          } else {
            slices = slices.map(([start, end], i) =>
              rows[i].units === target ? [start, end] : [start, end + 1]
            )
          }
        })
    )
  }

  return pipe(acc, transpose)
}

const input1 = [
  [1, 3, 5],
  [1, 5, 3],
]

const input2 = [
  [4, 1],
  [1, 1, 1, 1, 1],
]

const input3 = [
  [5, 3, 1],
  [3, 5, 1],
]

const expectedOutput1 = [
  [[1], [3, 5]],
  [[1], [5, 3]],
]
const expectedOutput2 = [
  [[4], [1]],
  [[1, 1, 1, 1], [1]],
]

const slice2D = <A extends unknown>(startEnds: number[][]) =>
  mapWithIndexA((i, a: A[]) => a.slice(startEnds[i][0], startEnds[i][1]))

test("sliceyFoo", () => {
  expect(
    slice2D([
      [0, 1],
      [0, 1],
    ])(input1)
  ).toEqual(expect.arrayContaining([[1], [1]]))

  expect(
    slice2D([
      [1, 3],
      [1, 2],
    ])(input1)
  ).toEqual(expect.arrayContaining([[3, 5], [5]]))
})

test("analyzeColumn", () => {
  expect(analyzeColumn(input1)).toEqual(
    expect.objectContaining({
      legit: true,
      rows: [
        { index: 0, units: 9 },
        { index: 1, units: 9 },
      ],
      target: 9,
    } as {
      rows: { units: number; index: number }[]
      legit: boolean
      target: number
    })
  )
})

describe("slice2D,analyzeColumn,input1", () => {
  test("input1 column 1", () => {
    expect(
      pipe(
        input1,
        slice2D([
          [0, 1],
          [0, 1],
        ]),
        analyzeColumn
      )
    ).toEqual(
      expect.objectContaining({
        legit: true,
        rows: [
          { index: 0, units: 1 },
          { index: 1, units: 1 },
        ],
        target: 1,
      })
    )
  })
  test("input1 column 2", () => {
    expect(
      pipe(
        input1,
        slice2D([
          [1, 2],
          [1, 2],
        ]),
        analyzeColumn
      )
    ).toEqual(
      expect.objectContaining({
        legit: false,
        rows: [
          { index: 0, units: 3 },
          { index: 1, units: 5 },
        ],
        target: 5,
      })
    )
  })
  test("input1 fail so open the lowest", () => {
    expect(
      pipe(
        input1,
        slice2D([
          [1, 3],
          [1, 2],
        ]),
        analyzeColumn
      )
    ).toEqual(
      expect.objectContaining({
        legit: false,
        rows: [
          { index: 0, units: 8 },
          { index: 1, units: 5 },
        ],
        target: 8,
      })
    )
  })
  test("input1 final success", () => {
    expect(
      pipe(
        input1,
        slice2D([
          [1, 3],
          [1, 3],
        ]),
        analyzeColumn
      )
    ).toEqual(
      expect.objectContaining({
        legit: true,
        rows: [
          { index: 0, units: 8 },
          { index: 1, units: 8 },
        ],
        target: 8,
      })
    )
  })
})

describe("columnify", () => {
  test("columnifyInput1", () => {
    expect(columnify(input1)).toEqual(expect.arrayContaining(expectedOutput1))
  })
  test("columnifyInput2", () => {
    expect(columnify(input2)).toEqual(expect.arrayContaining(expectedOutput2))
  })
})
