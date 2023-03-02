import { House } from "@/data/house"
import { useUpdatePosition } from "@/stores/houses"
import { useRowLayout } from "@/hooks/layouts"
import { mapWithIndexRA } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useRef } from "react"
import { Group } from "three"
import SiteHouseModule from "./SiteHouseModule"

type Props = {
  house: House
}

const SiteHouse = (props: Props) => {
  const { house } = props
  const groupRef = useRef<Group>()

  const {
    position: [x, z],
  } = house

  const onDrag = useUpdatePosition(house.id, groupRef)

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
  }>({
    onDrag,
  })

  const rows = pipe(
    useRowLayout(house.id),
    mapWithIndexRA((rowIndex, { modules, y }) => {
      const children = pipe(
        modules,
        mapWithIndexRA((gridIndex, { module, z }) => {
          const mirror = gridIndex === modules.length - 1
          return (
            <SiteHouseModule
              key={`${rowIndex},${gridIndex}`}
              module={module}
              rowIndex={rowIndex}
              gridIndex={gridIndex}
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

  return (
    <group ref={groupRef} {...(bind() as any)}>
      {rows}
    </group>
  )
}

export default SiteHouse
