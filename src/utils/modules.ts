import { LoadedModule, Module } from "@/data/module"
import { useGLTF } from "."

export const loadModule = ({ modelUrl, ...rest }: Module): LoadedModule => ({
  ...rest,
  gltf: useGLTF(modelUrl),
})
