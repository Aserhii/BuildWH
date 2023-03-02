import { PositionedColumn, useColumnLayout } from "@/hooks/layouts"
import { useVerticalCutPlanes } from "@/hooks/verticalCutPlanes"
import siteContext, {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import { outlineGroup } from "@/stores/highlights"
import { useUpdatePosition } from "@/stores/houses"
import scope from "@/stores/scope"
import { mapRA } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useRef } from "react"
import { Group } from "three"
import { subscribe } from "valtio"
import BuildingBuilding from "./BuildingBuilding"
import BuildingHouseColumn from "./ColumnBuildingColumn"

type Props = {
  id: string
}

const SiteBuildingMain = (props: Props) => {
  const { id } = props
  const groupRef = useRef<Group>()

  const contextMode = useSiteContextMode()

  useEffect(() => {
    if (contextMode !== SiteContextModeEnum.Enum.SITE) return

    return subscribe(scope, () => {
      outlineGroup(groupRef, {
        remove:
          scope.hovered?.buildingId !== id && scope.selected?.buildingId !== id,
      })
    })
  }, [contextMode])

  const columns = useColumnLayout(id)

  const verticalCutPlanes = useVerticalCutPlanes(columns, id)

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <BuildingHouseColumn
      key={columnIndex}
      buildingId={id}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columns.length - 1}
      verticalCutPlanes={verticalCutPlanes}
    />
  )

  return <group ref={groupRef}>{pipe(columns, mapRA(renderColumn))}</group>
}

const SiteBuilding = ({ id }: Props) => {
  const { buildingId } = useSiteContext()

  return buildingId !== id ? (
    <SiteBuildingMain id={id} />
  ) : (
    <BuildingBuilding id={id} />
  )
}

export default SiteBuilding
