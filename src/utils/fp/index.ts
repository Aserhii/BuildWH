import { reduce, zipWith } from "fp-ts/lib/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { concatAll } from "fp-ts/lib/Monoid"
import { Eq as NumEq, Ord as NumOrd } from "fp-ts/lib/number"
import {
  flatten as flattenO,
  isNone,
  map as mapO,
  none,
  Option,
  some,
} from "fp-ts/lib/Option"
import { clamp } from "fp-ts/lib/Ord"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { keys } from "fp-ts/lib/Record"
import {
  Eq as StrEq,
  Monoid,
  Ord as StrOrd,
  split,
  toUpperCase,
} from "fp-ts/lib/string"

export { transpose as transposeA } from "fp-ts-std/Array"
export { transpose as transposeRA } from "fp-ts-std/ReadonlyArray"
export {
  filter as filterA,
  filterMap as filterMapA,
  flatten as flattenA,
  map as mapA,
  mapWithIndex as mapWithIndexA,
  reduce as reduceA,
  reduceWithIndex as reduceWithIndexA,
} from "fp-ts/lib/Array"
export {
  map as mapM,
  mapWithIndex as mapWithIndexM,
  reduce as reduceM,
  reduceWithIndex as reduceWithIndexM,
} from "fp-ts/lib/Map"
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
  filterMapWithIndex as filterMapWithIndexR,
  filterWithIndex as filterWithIndexR,
  map as mapR,
  mapWithIndex as mapWithIndexR,
  reduce as reduceR,
} from "fp-ts/lib/Record"
export { map as mapT } from "fp-ts/lib/Task"
export { NumOrd, NumEq, StrOrd, StrEq }
export { min, max, abs, sign }
export { clamp_ as clamp }
export { mapO, flattenO }

const { min, max, abs, sign } = Math

const clamp_ = clamp(NumOrd)

export const pipeLog = <T extends unknown>(x: T): T => (console.log(x), x)

export const pipeLogWith =
  <T extends unknown>(f: (t: T) => void) =>
  (t: T): T => {
    console.log(f(t))
    return t
  }

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

export const notNullish =
  (msg = "notNullish error") =>
  <T extends unknown>(val: T | null | undefined): T => {
    if (val === null || val === undefined) {
      throw new Error(msg)
    }
    return val as T
  }

export const errorThrower = (message?: string) => () => {
  throw new Error(message)
}

export const reduceToOption: <A, B>(
  b: Option<B>,
  f: (i: number, b: Option<B>, a: A) => Option<B>
) => (fa: ReadonlyArray<A>) => Option<B> = (b, f) => (fa) => {
  const len = fa.length
  let out = b
  for (let i = 0; i < len; i++) {
    out = f(i, out, fa[i])
    if (isNone(out)) return none
  }
  return out
}

export const mapToOption =
  <A, B>(f: (a: A) => Option<B>) =>
  (fa: ReadonlyArray<A>): Option<ReadonlyArray<B>> => {
    const fb = new Array<B>(fa.length)
    //                   ^?
    for (let i = 0; i < fa.length; i++) {
      const result = f(fa[i])
      if (isNone(result)) return none
      else fb[i] = result.value
    }
    return some(fb)
  }
