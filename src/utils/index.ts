import Fuse from "fuse.js"
import { MutableRefObject, useEffect } from "react"
import { subscribe } from "valtio"

export const safeLocalStorageGet = (key: string): any => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null")
    return saved
  } catch (err) {
    return null
  }
}

export const fuzzyMatch =
  <T extends unknown>(list: ReadonlyArray<T>, options?: Fuse.IFuseOptions<T>) =>
  (queriedToken: string) => {
    const fuse = new Fuse(list, options)
    const result = fuse.search(queriedToken)[0]?.item
    console.log({ list, result })
    return result
  }

export const guardRef = <T extends unknown>(
  r: MutableRefObject<T | undefined>
): r is MutableRefObject<T> => Boolean(r.current)

export const guardNullable = <T extends unknown>(t: T | null): t is T =>
  t !== null

export const snapToGrid = (x: number) => {
  return Math.round(x)
}

export const undef = <T extends unknown>(t: T | undefined): t is undefined =>
  typeof t === "undefined"

export const SSR = typeof window === "undefined"

export type DeepReadonly<T> = T extends (...a: any[]) => any
  ? T
  : {
      readonly [P in keyof T]: DeepReadonly<T[P]>
    }

export * from "./three"
export * from "./fp"
