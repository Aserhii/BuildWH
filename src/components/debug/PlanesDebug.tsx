import debug from "@/stores/debug"
import { mapWithIndexRR } from "@/utils"
import { Plane } from "@react-three/drei"
import { pipe } from "fp-ts/lib/function"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import React, { useEffect, useRef } from "react"
import { DoubleSide, Mesh } from "three"
import { useSnapshot } from "valtio"
import { subscribeKey } from "valtio/utils"

const PlaneDebug = ({ id }: { id: string }) => {
  const ref = useRef<Mesh>()
  const {
    width = 10,
    height = 10,
    color = "red",
  } = useSnapshot(debug.planes[id])
  useEffect(
    () =>
      subscribeKey(debug.planes, id, () => {
        if (!ref.current) return
        const { position, rotation } = debug.planes[id]
        ref.current.position.set(...position)
        ref.current.rotation.set(...rotation)
      }),
    []
  )

  return (
    <Plane ref={ref} args={[width, height]}>
      <meshBasicMaterial side={DoubleSide} color={color} />
    </Plane>
  )
}

const PlanesDebug = () => {
  const { planes } = useSnapshot(debug)
  return (
    <group>
      {pipe(
        planes,
        mapWithIndexRR((id, v) => <PlaneDebug key={id} id={id} />),
        toReadonlyArray
      )}
    </group>
  )
}

export default PlanesDebug
