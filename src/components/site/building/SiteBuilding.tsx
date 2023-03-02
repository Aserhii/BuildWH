import RotateHandles from "@/components/ui-3d/RotateHandles"
import { PositionedColumn, useColumnLayout } from "@/hooks/layouts"
import { useVerticalCutPlanes } from "@/hooks/verticalCutPlanes"
import {
  EditModeEnum,
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import events, { glbExported } from "@/stores/events"
import { outlineGroup } from "@/stores/highlights"
import houses, { usePositionRotation } from "@/stores/houses"
import scope from "@/stores/scope"
import { mapRA } from "@/utils"
import { GLTFExporter } from "@/utils/GLTFExporter"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { Fragment, useEffect, useRef } from "react"
import { Group } from "three"
import { subscribe } from "valtio"
import BuildingBuilding from "./BuildingBuilding"
import ColumnBuildingColumn from "./ColumnBuildingColumn"

type Props = {
  id: string
}

const SiteBuildingMain = (props: Props) => {
  const { id } = props
  const groupRef = useRef<Group>()
  const contextMode = useSiteContextMode()
  const { editMode } = useSiteContext()

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
    <ColumnBuildingColumn
      key={columnIndex}
      buildingId={id}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columns.length - 1}
      verticalCutPlanes={verticalCutPlanes}
    />
  )

  const buildingLength = columns.reduce((acc, v) => acc + v.length, 0)
  const buildingWidth = columns[0].gridGroups[0].modules[0].module.width

  const { buildingDragHandler } = usePositionRotation(id, groupRef)

  const bind = useDrag(buildingDragHandler)

  useEffect(
    () =>
      subscribe(events, () => {
        if (events.exportBuildingGLB !== id || !groupRef.current) return

        const exporter = new GLTFExporter() as any

        exporter.parse(
          groupRef.current,
          function (gltf: any) {
            const link = document.createElement("a")
            link.style.display = "none"
            document.body.appendChild(link)

            const blob = new Blob([JSON.stringify(gltf)], {
              type: "application/json",
            })

            const objectURL = URL.createObjectURL(blob)

            link.href = objectURL
            link.href = URL.createObjectURL(blob)
            link.download = `${houses[id].friendlyName}.gltf`
            link.click()
          },
          { binary: false }
        )

        glbExported()
      }),
    []
  )

  return (
    <Fragment>
      <group ref={groupRef} {...(bind() as any)}>
        {pipe(columns, mapRA(renderColumn))}
        {editMode === EditModeEnum.Enum.MOVE_ROTATE && (
          <RotateHandles
            buildingId={id}
            buildingLength={buildingLength}
            buildingWidth={buildingWidth}
          />
        )}
      </group>
    </Fragment>
  )
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
