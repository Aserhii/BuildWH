import { House } from "@/data/house"
import { useColumnLayout } from "@/stores/layouts"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import BuildingHouseColumn from "./BuildingHouseColumn"
import Stretch from "./Stretch"

type Props = {
  house: House
}

const BuildingHouse = (props: Props) => {
  const { house } = props

  const {
    position: [x, z],
    id: buildingId,
  } = house

  const columnLayout = useColumnLayout(buildingId)

  const columns = pipe(
    columnLayout,
    mapRA(({ columnIndex, z, gridGroups }) => (
      <BuildingHouseColumn
        key={columnIndex}
        house={house}
        columnIndex={columnIndex}
        columnZ={z}
        gridGroups={gridGroups}
        mirror={columnIndex === columnLayout.length - 1}
      />
    ))
  )

  // house position/rotation group
  return (
    <group position={[x, 0, z]}>
      {/* house columns group */}
      <group>{columns}</group>
      <Stretch house={house} />
    </group>
  )
}

export default BuildingHouse
