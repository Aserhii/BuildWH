import { Material } from "@/data/material"
import { useGLTF as useGLTFDrei } from "@react-three/drei"
import {
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  Scene,
  Texture,
  TextureLoader,
} from "three"

export type GltfT = {
  nodes: {
    [key: string]: Mesh | Group | Scene
  }
}

export type ObjectRef = { current: Object3D }

export const useGLTF = <T extends string | string[]>(path: T) =>
  useGLTFDrei(path, true, true) as unknown as T extends any[] ? GltfT[] : GltfT

export const isMesh = (x: Object3D): x is Mesh => x.type === "Mesh"

export const createMaterial = (config: Material) => {
  if (config.defaultColor) {
    return new MeshStandardMaterial({
      color: config.defaultColor,
    })
  }

  const textureLoader = new TextureLoader()

  const setRepeat = (texture: Texture): void => {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(10, 10)
  }

  const extractOrNullTextureMap = (url: string | undefined | null) =>
    url ? textureLoader.load(url, setRepeat) : null
}
