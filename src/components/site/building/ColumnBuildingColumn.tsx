import { PositionedRow } from "@/hooks/layouts"
import { mapRA, mapWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { Plane } from "three"
import ColumnBuildingModule from "./ColumnBuildingModule"

type Props = {
  buildingId: string
  columnZ: number
  columnIndex: number
  mirror?: boolean
  gridGroups: readonly PositionedRow[]
  verticalCutPlanes: Plane[]
}

const BuildingHouseColumn = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    columnZ,
    gridGroups,
    mirror = false,
    verticalCutPlanes,
  } = props

  const levels = pipe(
    gridGroups,
    mapRA(({ levelIndex, modules, y }) =>
      pipe(
        modules,
        mapWithIndexRA((groupIndex, { module, z }) => {
          return (
            <ColumnBuildingModule
              key={JSON.stringify({
                columnIndex,
                levelIndex,
                groupIndex,
                dna: module.dna,
              })}
              module={module}
              columnIndex={columnIndex}
              levelIndex={levelIndex}
              levelY={y}
              groupIndex={groupIndex}
              buildingId={buildingId}
              position={[
                0,
                y,
                mirror ? z + module.length / 2 : z - module.length / 2,
              ]}
              scale={[1, 1, mirror ? 1 : -1]}
              verticalCutPlanes={verticalCutPlanes}
              columnZ={columnZ}
            />
          )
        })
      )
    )
  )

  return <group position-z={columnZ}>{levels}</group>
}

export default BuildingHouseColumn
