import { DEFAULT_ORIGIN } from "@/CONSTANTS"
import { PositionedRow } from "@/hooks/layouts"
import utils from "@/threebox/utils/utils"
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

  const lat = DEFAULT_ORIGIN[0]
  const UNITS_MULTIPLIER = utils.projectedUnitsPerMeter(lat)

  const position = utils.projectToWorld(DEFAULT_ORIGIN)

  const levels = pipe(
    gridGroups,
    mapRA(({ levelIndex, modules, y }) =>
      pipe(
        modules,
        mapWithIndexRA((groupIndex, { module, z }) => {
          const position = [
            0,
            y,
            mirror
              ? z + module.length / 2
              : z - module.length + module.length / 2,
          ].map((v) => UNITS_MULTIPLIER * v) as [number, number, number]

          console.log(`rendering ${module.dna} @ ${JSON.stringify(position)}`)

          return (
            <ColumnBuildingModule
              key={`${columnIndex}-${levelIndex}-${groupIndex}`}
              module={module}
              columnIndex={columnIndex}
              levelIndex={levelIndex}
              levelY={y}
              groupIndex={groupIndex}
              buildingId={buildingId}
              position={position}
              scale={[1, 1, mirror ? 1 : -1]}
              verticalCutPlanes={verticalCutPlanes}
            />
          )
        })
      )
    )
  )

  return <group position-z={columnZ}>{levels}</group>
}

export default BuildingHouseColumn
