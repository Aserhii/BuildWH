import { House } from "@/data/house"
import { Module } from "@/data/module"
import { useSystemsData } from "@/stores/systems"
import { fuzzyMatch, GltfT, isMesh, mapRA } from "@/utils"
import { GroupProps } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { map as mapA, reduce } from "fp-ts/lib/ReadonlyArray"
import {
  filter,
  filterWithIndex,
  map,
  mapWithIndex,
  toReadonlyArray,
} from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import React from "react"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import HouseModuleElement from "./HouseModuleElement"

type Props = GroupProps & {
  module: Module
  columnIndex: number
  rowIndex: number
  gltf: GltfT
  house: House
}

const HouseModule = (props: Props) => {
  const { module, columnIndex, gltf, house, rowIndex, ...groupProps } = props

  const { elements } = useSystemsData()

  const getElement = (nodeType: string) =>
    fuzzyMatch(elements, {
      keys: ["ifc4Variable"],
      threshold: 0.5,
    })(nodeType)

  const meshes = pipe(
    gltf.nodes,
    toReadonlyArray,
    reduce({}, (acc: { [e: string]: Mesh[] }, [nodeType, node]) => {
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
    map((meshes) => mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))),
    filter((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg)),
    // filterWithIndex((k) => k !== "Appliance"), // model needs clean-up??
    mapWithIndex((elementName, geometry) => (
      <HouseModuleElement
        key={elementName}
        {...{
          elementName,
          geometry,
          house,
          columnIndex,
          rowIndex,
        }}
      />
    )),
    toReadonlyArray,
    mapA(([_k, v]) => v)
  )

  return <group {...groupProps}>{meshes}</group>
}

export default HouseModule
