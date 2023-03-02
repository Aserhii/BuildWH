import { House } from "@/data/house"
import { Module } from "@/data/module"
import { setCameraEnabled } from "@/stores/camera"
import context from "@/stores/context"
import { BuildingRow } from "@/stores/housesRows"
import { MeshProps, useThree } from "@react-three/fiber"
import { useDrag, useGesture } from "@use-gesture/react"
import React, { Fragment, useRef } from "react"
import { DoubleSide, Mesh } from "three"

type Props = {
  house: House
  row0: BuildingRow
}

const StretchHandle = (props: MeshProps) => {
  const ref = useRef<Mesh>()
  const invalidate = useThree((three) => three.invalidate)
  const bind = useDrag(({ first, last }) => {
    if (!ref.current) return
    if (first) setCameraEnabled(false)
    const [, dz] = context.pointer
    ref.current.position.z = dz
    invalidate()

    // have vanilla module
    // every time hits new vanilla module length from origin
    // either just move the first column
    // or... fill?

    // would also have to de-fill on other direction

    // min max (constrain)

    // prob leave the state house alone
    // create modules in transient space?

    // maybe you can just update state on house...
    // but you're depending on row 0 ...

    // in any case you need to calculate the additional modules

    // each row has vanilla modules for END and MID
    // so attach to houseRows?

    // could you update stretch handles based on
    // subscribe
    // to dna and drag?

    // would need to not take props

    // experiment:
    // stretch handles takes no props
    // when drag, update house dna
    // see if stretch handles re-renders

    // if it does, try SoC components

    if (last) setCameraEnabled(true)
  })
  return (
    <mesh ref={ref} {...props} rotation-x={-Math.PI / 2} {...(bind() as any)}>
      <circleBufferGeometry />
      <meshBasicMaterial color="steelblue" side={DoubleSide} />
    </mesh>
  )
}

const StretchHandles = (props: Props) => {
  const {
    house: {
      position: [x0, z0],
    },
    row0: { row, vanillaModules },
  } = props
  const z1 = row[0].z + 3
  const z2 = row[row.length - 1].z - 3

  return (
    <Fragment>
      <StretchHandle position={[x0, 0, z1]} />
      <StretchHandle position={[x0, 0, z2]} />
    </Fragment>
  )
}

export default StretchHandles
