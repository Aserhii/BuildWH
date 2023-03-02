import { House } from "@/data/house"
import { BuildingRow, useHouseRows } from "@/stores/housesRows"
import { mapRA, mapWithIndexRA, useGLTF } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { flatten } from "fp-ts/lib/ReadonlyArray"
import { Fragment, useEffect, useRef } from "react"
import { Group } from "three"
import SiteHouseModule from "../site/SiteHouseModule"
import StretchHandles from "./StretchHandles"

type Props = {
  house: House
}

const BuildingHouse = (props: Props) => {
  const { house } = props
  const groupRef = useRef<Group>()

  const {
    position: [x, z],
  } = house

  const rows = useHouseRows(house.id)

  // const onDrag = useUpdatePosition(house.id, groupRef)

  // useCameraFocus(house)

  // const bind = useGesture<{
  //   drag: ThreeEvent<PointerEvent>
  //   hover: ThreeEvent<PointerEvent>
  // }>({
  //   onDrag,
  // })

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
    mapWithIndexRA((rowIndex, { row, y }) => {
      const children = pipe(
        row,
        mapWithIndexRA((gridIndex, { module, z }) => {
          moduleIndex++
          const mirror = gridIndex === row.length - 1
          return (
            <SiteHouseModule
              key={`${rowIndex},${gridIndex}`}
              module={module}
              rowIndex={rowIndex}
              gridIndex={gridIndex}
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

      return (
        <group key={rowIndex} position={[0, y, 0]}>
          {children}
        </group>
      )
    })
  )
  moduleIndex = -1

  // start with one handle
  // place it before the house
  // drag it around

  return (
    <Fragment>
      <group
        ref={groupRef}
        position={[x, 0, z]}
        // {...(bind() as any)}
      >
        {modules}
      </group>
      <StretchHandles house={house} row0={rows[0] as BuildingRow} />
    </Fragment>
  )
}

export default BuildingHouse
