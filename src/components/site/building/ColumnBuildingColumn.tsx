import { PositionedRow } from "@/hooks/layouts"
import { mapRA, mapWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import ColumnBuildingModule from "./ColumnBuildingModule"

type Props = {
  buildingId: string
  columnZ: number
  columnIndex: number
  mirror?: boolean
  gridGroups: readonly PositionedRow[]
  visible?: boolean
}

const BuildingHouseColumn = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    columnZ,
    gridGroups,
    mirror = false,
    visible = true,
  } = props
  const levels = pipe(
    gridGroups,
    mapRA(({ levelIndex, modules, y }) =>
      pipe(
        modules,
        mapWithIndexRA((groupIndex, { module, z }) => (
          <ColumnBuildingModule
            key={`${columnIndex}-${levelIndex}-${groupIndex}`}
            module={module}
            columnIndex={columnIndex}
            levelIndex={levelIndex}
            levelY={y}
            groupIndex={groupIndex}
            buildingId={buildingId}
            position={[
              0,
              y,
              mirror
                ? z + module.length / 2
                : z - module.length + module.length / 2,
            ]}
            scale={[1, 1, mirror ? 1 : -1]}
            visible={visible}
          />
        ))
      )
    )
  )

  return <group position-z={columnZ}>{levels}</group>
}

export default BuildingHouseColumn
