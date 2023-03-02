import { House } from "@/data/house"
import { useUpdatePosition } from "@/stores/houses"
import { useHouseRows } from "@/stores/housesRows"
import { useScopeType } from "@/stores/scope"
import { mapRA, mapWithIndexRA, useGLTF } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { flatten } from "fp-ts/lib/ReadonlyArray"
import { useRef } from "react"
import { Group } from "three"
import HouseModule from "./HouseModule"

// change house type in airtable
// hard code the house type for now

// or not?
// it still goes END to END
// our prev heuristic was F < R etc
// new heuristic is ...

// which modules are in house type A?
// dup those modules over to new airtable
// but with unit type / length

type Props = {
  house: House
}

const House = (props: Props) => {
  const { house } = props
  const groupRef = useRef<Group>()

  const rows = useHouseRows(house.id)

  const onDrag = useUpdatePosition(house.id, groupRef)
  // const invalidate = useThree((three) => three.invalidate)

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
  }>({
    onDrag,
  })

  const gltfs = pipe(
    rows,
    mapRA((row) =>
      pipe(
        row.row,
        mapRA((r) => r.module.modelUrl)
      )
    ),
    flatten,
    (modelUrls) => useGLTF(modelUrls as string[])
  )

  // store moduleIndex in the rows store maybe?
  let moduleIndex = -1

  const modules = pipe(
    rows,
    mapWithIndexRA((columnIndex, { row, y }) => {
      // console.log(
      //   row.map((r) => [
      //     r.module.structuredDna.level,
      //     r.module.structuredDna.levelType,
      //   ])
      // )

      // might need a component here for rows
      // we need to bind gesture handling
      // if the level is R

      const children = pipe(
        row,
        mapWithIndexRA((rowIndex, { module, z }) => {
          moduleIndex++
          const mirror = rowIndex === row.length - 1
          return (
            <HouseModule
              key={`${columnIndex},${rowIndex}`}
              module={module}
              columnIndex={columnIndex}
              rowIndex={rowIndex}
              gltf={gltfs[moduleIndex]}
              house={house}
              position={[
                0,
                0,
                mirror
                  ? z + module.length / 2
                  : z - module.length + module.length / 2,
              ]}
              scale={[1, 1, mirror ? 1 : -1]}
            />
          )
        })
      )

      return <group position={[0, y, 0]}>{children}</group>
    })
  )
  moduleIndex = -1

  return (
    <group ref={groupRef} {...(bind() as any)}>
      {modules}
    </group>
  )
}

export default House
