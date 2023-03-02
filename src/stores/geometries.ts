import { useSystemsData } from "@/contexts/SystemsData"
import { filterR, fuzzyMatch, GltfT, isMesh, mapR, reduceA } from "@/utils"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { toUndefined } from "fp-ts/lib/Option"
import { toArray } from "fp-ts/lib/Record"
import produce from "immer"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import { proxyMap } from "valtio/utils"

type ModuleDna = string

type ElementName = string

const geometries = proxyMap<ModuleDna, Map<ElementName, BufferGeometry>>()

export const useGeometry = (
  moduleDna: string,
  elementName: string,
  gltf: GltfT
) => {
  const { elements } = useSystemsData()

  const maybeGeometry = geometries.get(moduleDna)?.get(elementName)
  if (maybeGeometry) return maybeGeometry

  const elementMap = new Map<ElementName, BufferGeometry>()

  const getElement = (nodeType: string) =>
    pipe(
      elements,
      findFirst((el) => el.ifc4Variable === nodeType),
      toUndefined
    )

  const elementMeshes = pipe(
    gltf.nodes,
    toArray,
    reduceA({}, (acc: { [e: string]: Mesh[] }, [nodeType, node]) => {
      const element = getElement(nodeType)
      if (!element) return acc
      return produce(acc, (draft) => {
        node.traverse((child) => {
          if (isMesh(child)) {
            if (element.name in draft) draft[element.name].push(child)
            else draft[element.name] = [child]
          }
        })
      })
    }),
    mapR((meshes) =>
      mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))
    ),
    filterR((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg))
  )

  Object.entries(elementMeshes).forEach(([k, v]) => {
    elementMap.set(k, v)
  })

  geometries.set(moduleDna, elementMap)

  const geometry = elementMap.get(elementName)

  if (!geometry) throw new Error("No buffer geometry for element")

  return geometry
}

export const useModuleGeometries = (moduleDna: string, gltf: GltfT) => {
  const { elements } = useSystemsData()

  const maybeModuleGeometries = geometries.get(moduleDna)
  if (maybeModuleGeometries) return maybeModuleGeometries

  const elementMap = new Map<ElementName, BufferGeometry>()

  const getElement = (nodeType: string) =>
    fuzzyMatch(elements, {
      keys: ["ifc4Variable"],
      threshold: 0.5,
    })(nodeType)

  const elementMeshes = pipe(
    gltf.nodes,
    toArray,
    reduceA({}, (acc: { [e: string]: Mesh[] }, [nodeType, node]) => {
      const element = getElement(nodeType)
      if (!element || element.name === "Appliance") return acc
      return produce(acc, (draft) => {
        node.traverse((child) => {
          if (isMesh(child)) {
            if (element.name in draft) draft[element.name].push(child)
            else draft[element.name] = [child]
          }
        })
      })
    }),
    mapR((meshes) =>
      mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))
    ),
    filterR((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg))
  )

  Object.entries(elementMeshes).forEach(([k, v]) => {
    elementMap.set(k, v)
  })

  geometries.set(moduleDna, elementMap)

  return elementMap
}

export default geometries
