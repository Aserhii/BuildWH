// import { MeshPhysicalMaterialProps } from 'react-three-fiber'
import { MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from "three";

export const glassMaterialProps: MeshPhysicalMaterialParameters = {
  // -- thickness of the clear coat layer, from 0.0 to 1.0
  clearcoat: 0.1,
  // -- Index-of-refraction for non-metallic materials, from 1.0 to 2.333. Default is 1.5.
  ior: 0.5,
  // -- Degree of reflectivity, from 0.0 to 1.0. Default is 0.5, which corresponds to an index-of-refraction of 1.5
  reflectivity: 0.5,
  // -- Degree of transmission (or optical transparency), from 0.0 to 1.0. Default is 0.0.
  // Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.
  // When transmission is non-zero, opacity should be set to 1.
  transmission: 0.5,

  // color: "clear",
  metalness: 0,
  roughness: 0,
  alphaTest: 0.5,
  // envMap: hdrCubeRenderTarget.texture,
  // envMapIntensity: params.envMapIntensity,
  depthWrite: false,
  opacity: 1, // set material.opacity to 1 when material.transmission is non-zero
  transparent: true,
};

const glassMaterial = new MeshPhysicalMaterial(glassMaterialProps);

export default glassMaterial;
