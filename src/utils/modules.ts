import { LoadedModule, Module } from "@/data/module"
import { pipe } from "fp-ts/lib/function"
import { sort as sortNEA } from "fp-ts/lib/NonEmptyArray"
import { useGLTF } from "."
import { Ord as StrOrd } from "fp-ts/lib/string"
import { contramap } from "fp-ts/lib/Ord"
import { sort as sortA } from "fp-ts/lib/Array"

export const loadModule = ({ modelUrl, ...rest }: Module): LoadedModule => ({
  ...rest,
  gltf: useGLTF(modelUrl),
})

export const sortByDnaNEA = sortNEA(
  pipe(
    StrOrd,
    contramap((m: Module) => m.dna)
  )
)

export const sortByDnaA = sortA(
  pipe(
    StrOrd,
    contramap((m: Module) => m.dna)
  )
)
