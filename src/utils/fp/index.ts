import { reduce, zipWith } from "fp-ts/lib/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { concatAll } from "fp-ts/lib/Monoid"
import { Ord as NumOrd, Eq as NumEq } from "fp-ts/lib/number"
import { map as mapO } from "fp-ts/lib/Option"
import { clamp } from "fp-ts/lib/Ord"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { keys } from "fp-ts/lib/Record"
import {
  Monoid,
  split,
  toUpperCase,
  Eq as StrEq,
  Ord as StrOrd,
} from "fp-ts/lib/string"

export { NumOrd, NumEq, StrOrd, StrEq }

const { min, max, abs, sign } = Math

export {
  filter as filterA,
  filterMap as filterMapA,
  map as mapA,
  mapWithIndex as mapWithIndexA,
  reduce as reduceA,
  reduceWithIndex as reduceWithIndexA,
  flatten as flattenA,
} from "fp-ts/lib/Array"
export {
  filter as filterNEA,
  head as headNEA,
  map as mapNEA,
  reduce as reduceNEA,
} from "fp-ts/lib/NonEmptyArray"
export {
  chunksOf as chunksOfRA,
  filter as filterRA,
  filterMap as filterMapRA,
  filterMapWithIndex as filterMapWithIndexRA,
  map as mapRA,
  mapWithIndex as mapWithIndexRA,
  reduce as reduceRA,
  reduceWithIndex as reduceWithIndexRA,
  zip as zipRA,
} from "fp-ts/lib/ReadonlyArray"
export {
  chunksOf as chunksOfRNA,
  mapWithIndex as mapWithIndexRNA,
} from "fp-ts/lib/ReadonlyNonEmptyArray"
export {
  filter as filterRR,
  filterMap as filterMapRR,
  filterMapWithIndex as filterMapWithIndexRR,
  map as mapRR,
  mapWithIndex as mapWithIndexRR,
  reduce as reduceRR,
} from "fp-ts/lib/ReadonlyRecord"
export {
  filter as filterR,
  map as mapR,
  mapWithIndex as mapWithIndexR,
  filterMapWithIndex as filterMapWithIndexR,
  reduce as reduceR,
} from "fp-ts/lib/Record"
export { map as mapT } from "fp-ts/lib/Task"
export { min, max, abs, sign }
export { clamp_ as clamp }
export { mapO }
export {
  map as mapM,
  reduce as reduceM,
  mapWithIndex as mapWithIndexM,
  reduceWithIndex as reduceWithIndexM,
} from "fp-ts/lib/Map"

export { transpose as transposeA } from "fp-ts-std/Array"
export { transpose as transposeRA } from "fp-ts-std/ReadonlyArray"

const clamp_ = clamp(NumOrd)

export const pipeLog = <T extends unknown>(x: T): T => (console.log(x), x)

export const upperFirst = flow(
  split(""),
  modifyAt(0, toUpperCase),
  mapO(concatAll(Monoid))
)

export const any = (...args: boolean[]) =>
  args.reduce((acc, v) => acc || v, false)
export const all = (...args: boolean[]) =>
  args.reduce((acc, v) => acc && v, true)
// export const all = concatAll(MonoidAll)

export const findA2 =
  <T extends unknown>(
    comparator: (a: T, b: T | undefined) => boolean = (a, b) => a === b
  ) =>
  (target: T[][]) =>
  (input: T[][]): [number, number][] => {
    let indices: [number, number][] = []
    for (let x = 0; x < input.length; x++) {
      for (let y = 0; y < input[x].length; y++) {
        if (
          (function () {
            for (let tx = 0; tx < target.length; tx++) {
              for (let ty = 0; ty < target[tx].length; ty++) {
                if (!comparator(target[tx][ty], input?.[x + tx]?.[y + ty])) {
                  return false
                }
              }
            }
            return true
          })()
        ) {
          indices = [...indices, [x, y]]
        }
      }
    }
    return indices
  }

export const objComp = (a: Record<string, any>, b: Record<string, any>) =>
  pipe(
    keys(a),
    reduce(true, (acc, k) => acc && a[k] === b[k])
  )

export const hamming = (a: string, b: string) => {
  if (a.length !== b.length) throw new Error("Hamming of different lengths")

  return zipWith(a.split(""), b.split(""), (a, b) =>
    abs(a.codePointAt(0)! - b.codePointAt(0)!)
  ).reduce((acc, v) => acc + v, 0)
}
