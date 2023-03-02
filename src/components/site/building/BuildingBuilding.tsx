import { useRotateVector } from "@/hooks/geometry"
import { PositionedColumn } from "@/hooks/layouts"
import { stretch, useStretch, VanillaPositionedRow } from "@/hooks/stretch"
import { useVerticalCutPlanes } from "@/hooks/verticalCutPlanes"
import defaultMaterial from "@/materials/defaultMaterial"
import handleMaterial from "@/materials/handleMaterial"
import { setCameraEnabled } from "@/stores/camera"
import { EditModeEnum, useSiteContext } from "@/stores/context"
import { useHouse } from "@/stores/houses"
import pointer from "@/stores/pointer"
import { filterRA, mapRA } from "@/utils"
import { Instance, Instances } from "@react-three/drei"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { Handler, useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { Fragment, useMemo, useRef } from "react"
import { Color, Group, Plane, Vector3 } from "three"
import { useSnapshot } from "valtio"
import BuildingHouseColumn from "./ColumnBuildingColumn"

type StretchHandleProps = MeshProps & {
  onDrag: Handler<"drag", ThreeEvent<PointerEvent>>
}

const StretchHandle = (props: StretchHandleProps) => {
  const { onDrag, ...meshProps } = props
  const bind = useDrag<ThreeEvent<PointerEvent>>((state) => {
    const { first, last } = state
    if (first) setCameraEnabled(false)
    if (last) setCameraEnabled(true)
    onDrag(state)
    invalidate()
  })
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      {...meshProps}
      {...(bind() as any)}
      material={handleMaterial}
    >
      <circleBufferGeometry args={[0.5, 24]} />
    </mesh>
  )
}

type StretchedColumnsProps = {
  startColumn: PositionedColumn
  endColumn: PositionedColumn
  vanillaPositionedRows: readonly VanillaPositionedRow[]
}

const StretchedColumns = (props: StretchedColumnsProps) => {
  const { startColumn, endColumn, vanillaPositionedRows } = props
  const { startVanillaColumns, endVanillaColumns } = useSnapshot(stretch)

  const { levelIndex: ctxLevelIndex } = useSiteContext()

  const stretchMaterial = useMemo(() => {
    const material = defaultMaterial.clone()
    material.color = new Color("white")
    if (ctxLevelIndex !== null) {
      const levelY = vanillaPositionedRows[ctxLevelIndex].y
      const module = vanillaPositionedRows[ctxLevelIndex].modules[0].module
      const levelCutPlane: Plane = new Plane(
        new Vector3(0, -1, 0),
        levelY + module.height / 2
      )
      material.clippingPlanes = [levelCutPlane]
    }
    return material
  }, [ctxLevelIndex])

  return (
    <Fragment>
      <group position-z={startColumn.length}>
        {pipe(
          vanillaPositionedRows,
          filterRA(
            ({ levelIndex }) => levelIndex <= (ctxLevelIndex ?? Infinity)
          ),
          mapRA(({ geometry, length, y, levelIndex }) => (
            <Instances
              key={levelIndex}
              geometry={geometry}
              material={stretchMaterial}
              position-y={y}
            >
              {[...Array(Math.max(0, startVanillaColumns))].map((_, i) => (
                <Instance key={i} position-z={-length * i} />
              ))}
            </Instances>
          ))
        )}
      </group>
      <group position-z={endColumn.z + endColumn.length}>
        {pipe(
          vanillaPositionedRows,
          mapRA(({ geometry, length, y, levelIndex }) => (
            <Instances
              key={levelIndex}
              geometry={geometry}
              material={stretchMaterial}
              position-y={y}
            >
              {[...Array(Math.max(0, endVanillaColumns))].map((_, i) => (
                <Instance key={i} position-z={length * i} />
              ))}
            </Instances>
          ))
        )}
      </group>
    </Fragment>
  )
}

type MidColumnsProps = {
  buildingId: string
  columnLayout: PositionedColumn[]
  midColumns: readonly PositionedColumn[]
  verticalCutPlanes: Plane[]
}

const MidColumns = (props: MidColumnsProps) => {
  const { buildingId, columnLayout, midColumns, verticalCutPlanes } = props

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <BuildingHouseColumn
      key={columnIndex}
      buildingId={buildingId}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columnLayout.length - 1}
      verticalCutPlanes={verticalCutPlanes}
    />
  )

  return <group>{pipe(midColumns, mapRA(renderColumn))}</group>
}

type Props = {
  id: string
}

const BuildingBuilding = (props: Props) => {
  const { id } = props

  const {
    position: [buildingX, buildingZ],
    rotation,
  } = useHouse(id)

  const {
    startColumn,
    midColumns,
    endColumn,
    columnLayout,
    startClamp,
    endClamp,
    vanillaPositionedRows,
    sendDrag,
    sendDrop,
  } = useStretch(id)

  const startRef = useRef<Group>(null!)
  const endRef = useRef<Group>(null!)

  const handleOffset = 1

  const { editMode } = useSiteContext()

  const verticalCutPlanes = useVerticalCutPlanes(columnLayout, id)

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <BuildingHouseColumn
      key={columnIndex}
      buildingId={id}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columnLayout.length - 1}
      verticalCutPlanes={verticalCutPlanes}
    />
  )

  const rotateVector = useRotateVector(id)

  return (
    <group position={[buildingX, 0, buildingZ]} rotation={[0, rotation, 0]}>
      <group ref={startRef}>
        {renderColumn(startColumn)}

        {editMode === EditModeEnum.Enum.STRETCH && (
          <StretchHandle
            onDrag={({ first, last }) => {
              const [, pz] = rotateVector(pointer.xz)
              const [, bz] = rotateVector([buildingX, buildingZ])

              const z = pipe(handleOffset + pz - bz, startClamp)

              startRef.current.position.z = z

              sendDrag(z, { isStart: true, first })

              if (last) {
                startRef.current.position.z = 0
                sendDrop()
              }
            }}
            position-z={startColumn.z - handleOffset}
          />
        )}
      </group>
      <group ref={endRef}>
        {renderColumn(endColumn)}
        {editMode === EditModeEnum.Enum.STRETCH && (
          <StretchHandle
            onDrag={({ first, last }) => {
              const [, pz] = rotateVector(pointer.xz)
              const [, bz] = rotateVector([buildingX, buildingZ])

              const z = pipe(-(endColumn.z + handleOffset) + pz - bz, endClamp)

              endRef.current.position.z = z

              sendDrag(z, { isStart: false, first })

              if (last) {
                endRef.current.position.z = 0
                sendDrop()
              }
            }}
            position-z={endColumn.z + endColumn.length + handleOffset}
          />
        )}
      </group>
      <MidColumns
        columnLayout={columnLayout}
        buildingId={id}
        midColumns={midColumns}
        verticalCutPlanes={verticalCutPlanes}
      />
      <StretchedColumns
        {...{ endColumn, startColumn, vanillaPositionedRows }}
      />
    </group>
  )
}

export default BuildingBuilding
