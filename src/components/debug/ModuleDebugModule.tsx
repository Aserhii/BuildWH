import { Module } from "@/data/module"
import defaultMaterial from "@/materials/defaultMaterial"
import { isMesh, useGLTF } from "@/utils"
import { values } from "fp-ts-std/ReadonlyRecord"
import { pipe } from "fp-ts/lib/function"
import { mapWithIndex, reduce } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { Fragment } from "react"
import { Mesh } from "three"

const ModuleDebugModule = ({ module }: { module: Module }) => {
  const gltf = useGLTF(module.modelUrl)

  const meshes = pipe(
    gltf.nodes,
    values,
    reduce([], (acc: Mesh[], node) => {
      return produce(acc, (draft) => {
        node.traverse((child) => {
          if (isMesh(child)) {
            draft.push(child)
          }
        })
      })
    }),
    mapWithIndex((i, node) => (
      <mesh key={i} material={defaultMaterial} geometry={node.geometry} />
    ))
  )

  return (
    <Fragment>
      <group>{meshes}</group>
      <mesh position={[0, module.height / 2, -module.length / 2]}>
        <boxBufferGeometry
          args={[module.width, module.height, module.length]}
        />
        <meshBasicMaterial color="blue" wireframe />
      </mesh>
    </Fragment>
  )
}

export default ModuleDebugModule
