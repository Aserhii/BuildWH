import { House } from "@/data/house"
import { setCameraEnabled } from "@/stores/camera"
import context, { useContext } from "@/stores/context"
import { modulesToRows, useBuildingModules } from "@/stores/houses"
import { useStretchedColumns } from "@/stores/stretch"
import { mapRA } from "@/utils"
import { useThree } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import React, { Fragment, useRef } from "react"
import { DoubleSide, Mesh } from "three"
import BuildingHouseColumn from "./BuildingHouseColumn"

type Props = {
  house: House
}

const StretchHandle = (props: Props) => {
  const { house } = props

  const ref = useRef<Mesh>()
  const invalidate = useThree((three) => three.invalidate)

  const [newDeltaZ, extraCols] = useStretchedColumns(house.id, true)

  // const { deleteRow } = useBuildingTransforms()

  let dragging = false,
    z0 = 0

  // useEffect(() => {
  //   let kill: any
  //   ;(async function () {
  //     const rows = await housesRows
  //     kill = subscribe(rows, (input) => {})
  //   })()
  //   return kill
  // }, [])

  // const houseRows = useHouseRows(buildingId!)

  // const vanillaModules = useVanillaModules(buildingId)

  const bind = useDrag(({ first, last }) => {
    if (!ref.current) return
    const [, pz] = context.pointer
    if (first) {
      setCameraEnabled(false)
      z0 = pz
    }
    ref.current.position.z = pz

    newDeltaZ(pz - z0)

    if (last) {
      setCameraEnabled(true)
    }

    invalidate()
  })

  return (
    <Fragment>
      <mesh
        ref={ref}
        rotation-x={-Math.PI / 2}
        {...(bind() as any)}
        // onClick={() => deleteRow(0)}
      >
        <circleBufferGeometry />
        <meshBasicMaterial color="steelblue" side={DoubleSide} />
      </mesh>
      <group>
        {pipe(
          extraCols,
          mapRA(({ columnIndex, gridGroups, z }) => (
            <BuildingHouseColumn
              key={columnIndex}
              columnIndex={columnIndex}
              gridGroups={gridGroups}
              columnZ={z}
              house={house}
            />
          ))
        )}
      </group>
    </Fragment>
  )
}

// const EndModules = () => {
//   const { buildingId } = useContext()
//   if (!buildingId) throw new Error("No buildingId in stretch")
//   const rows = useHouseRows(buildingId)
//   const ends = pipe(
//     rows,
//     mapRA(({ row, vanillaModules, y }) =>
//       pipe(
//         row,
//         filterWithIndex((i) => i === 0 || i === row.length - 1),
//         (row) => ({ row, vanillaModules, y })
//       )
//     )
//   )
//   const children = pipe(ends)
//   return null
// }

// const ExtraModules = () => {
//   return null
// }

const Stretch = (props: Props) => {
  const { house } = props

  return (
    <Fragment>
      <StretchHandle house={house} />
      {/* <group>{extraCols}</group> */}
      {/* <EndModules />
      <ExtraModules /> */}
    </Fragment>
  )
}

export default Stretch

// const StretchHandles = () => {
//   // const {
//   //   house: {
//   //     position: [x0, z0],
//   //   },
//   //   row0: { row, vanillaModules },
//   // } = props
//   // const z1 = row[0].z + 3
//   // const z2 = row[row.length - 1].z - 3

//   return (
//     <Fragment>
//       <StretchHandle />
//       {/* <StretchHandle back /> */}
//     </Fragment>
//   )
// }

// export default StretchHandles

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

// what about do everything in the drag handler but simply
// read the relevant proxies?

// maybe try without moving the handles first
// (stick the handle at the side, maybe it goes both ways)
