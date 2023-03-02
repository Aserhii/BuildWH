import { boolean } from "fp-ts"
import { flow } from "fp-ts/lib/function"
import { concatAll } from "fp-ts/lib/Monoid"
import { map as mapO } from "fp-ts/lib/Option"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { Monoid, split, toUpperCase } from "fp-ts/lib/string"

export {
  filter as filterA,
  map as mapA,
  reduce as reduceA,
} from "fp-ts/lib/Array"
export {
  chunksOf as chunksOfRA,
  filter as filterRA,
  map as mapRA,
  mapWithIndex as mapWithIndexRA,
  reduce as reduceRA,
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
  reduce as reduceRR,
} from "fp-ts/lib/ReadonlyRecord"
export {
  filter as filterR,
  map as mapR,
  reduce as reduceR,
} from "fp-ts/lib/Record"
export { map as mapT } from "fp-ts/lib/Task"
export { mapO }

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
