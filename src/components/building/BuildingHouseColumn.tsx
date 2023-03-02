import { House } from "@/data/house"
import { PositionedRow } from "@/stores/layouts"
import { mapRA, mapWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import SiteHouseModule from "../site/SiteHouseModule"

type Props = {
  house: House
  columnZ: number
  columnIndex: number
  mirror?: boolean
  gridGroups: readonly PositionedRow[]
}

const BuildingHouseColumn = (props: Props) => {
  const { house, columnIndex, columnZ, gridGroups, mirror = false } = props
  const levels = pipe(
    gridGroups,
    mapRA(({ levelIndex, modules, y }) =>
      pipe(
        modules,
        mapWithIndexRA((gridIndex, { module, z }) => (
          <SiteHouseModule
            key={`${columnIndex}-${levelIndex}-${gridIndex}`}
            module={module}
            rowIndex={levelIndex}
            gridIndex={gridIndex}
            house={house}
            position={[
              0,
              y,
              mirror
                ? z + module.length / 2
                : z - module.length + module.length / 2,
            ]}
            scale={[1, 1, mirror ? 1 : -1]}
          />
        ))
      )
    )
  )

  return <group position-z={columnZ}>{levels}</group>
}

export default BuildingHouseColumn
