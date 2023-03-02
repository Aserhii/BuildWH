import { BareModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import {
  columnLayoutToMatrix,
  PositionedColumn,
  useColumnLayout,
} from "@/hooks/layouts"
import { useVerticalCutPlanes } from "@/hooks/verticalCutPlanes"
import defaultMaterial from "@/materials/defaultMaterial"
import { setCameraEnabled } from "@/stores/camera"
import { EditModeEnum, useSiteContext } from "@/stores/context"
import { useHouse } from "@/stores/houses"
import pointer from "@/stores/pointer"
import { useShadows } from "@/stores/settings"
import {
  stretch,
  useStretchLength,
  useStretchWidth,
  VanillaPositionedRow,
} from "@/stores/stretch"
import swap from "@/stores/swap"
import { clamp, filterRA, flattenA, mapA, mapRA, reduceA } from "@/utils"
import { Instance, Instances } from "@react-three/drei"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { Handler, useGesture } from "@use-gesture/react"
import { takeLeft } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import {
  forwardRef,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import mergeRefs from "react-merge-refs"
import {
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Plane,
  Vector3,
} from "three"
import { useSnapshot } from "valtio"
import HandleMaterial from "../../../materials/HandleMaterial"
import ColumnBuildingColumn from "./ColumnBuildingColumn"

type StretchHandleProps = MeshProps & {
  onDrag?: Handler<"drag", ThreeEvent<PointerEvent>>
  onHover?: Handler<"hover", ThreeEvent<PointerEvent>>
}

const StretchHandle = forwardRef<Mesh, StretchHandleProps>(
  (props, forwardedRef) => {
    const localRef = useRef<Mesh>()
    const { onDrag, onHover, ...meshProps } = props
    const [shadows] = useShadows()

    const bind = useGesture<{
      drag: ThreeEvent<PointerEvent>
      hover: ThreeEvent<PointerEvent>
    }>({
      onHover: (state) => {
        if (state.hovering) {
          document.body.style.cursor = "grab"
        } else {
          document.body.style.cursor = ""
        }
        onHover?.(state)
      },
      onDrag: (state) => {
        const { first, last } = state
        if (first) setCameraEnabled(false)
        if (last) setCameraEnabled(true)
        onDrag?.(state)
        invalidate()
      },
    })

    useEffect(() => {
      if (!localRef.current) return
      if (shadows) {
        ;(localRef.current.material as MeshStandardMaterial).color = new Color(
          "white"
        )
      } else {
        ;(localRef.current.material as MeshStandardMaterial).color = new Color(
          "black"
        )
      }
    }, [shadows])

    return (
      <mesh
        ref={mergeRefs([localRef, forwardedRef])}
        rotation-x={-Math.PI / 2}
        {...meshProps}
        {...(bind() as any)}
      >
        <circleBufferGeometry args={[0.5, 24]} />
        <HandleMaterial />
      </mesh>
    )
  }
)

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
    <ColumnBuildingColumn
      key={JSON.stringify({ buildingId, columnIndex })}
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
  buildingId: string
}

const BuildingBuilding = (props: Props) => {
  const { buildingId } = props

  const {
    position: [buildingX, buildingZ],
    rotation,
  } = useHouse(buildingId)

  const columnLayout = useColumnLayout(buildingId)
  swap.activeBuildingMatrix = columnLayoutToMatrix(columnLayout)

  const {
    startColumn,
    midColumns,
    endColumn,
    startClamp,
    endClamp,
    vanillaPositionedRows,
    sendDrag,
    sendDrop,
  } = useStretchLength(buildingId, columnLayout)

  const startRef = useRef<Group>(null!)
  const endRef = useRef<Group>(null!)

  const handleOffset = 1

  const { editMode } = useSiteContext()

  const verticalCutPlanes = useVerticalCutPlanes(columnLayout, buildingId)

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <ColumnBuildingColumn
      key={columnIndex}
      buildingId={buildingId}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columnLayout.length - 1}
      verticalCutPlanes={verticalCutPlanes}
    />
  )

  const rotateVector = useRotateVector(buildingId)

  const houseWidth = startColumn.gridGroups[0].modules[0].module.width
  const houseLength = pipe(
    columnLayout,
    (x) => columnLayoutToMatrix<BareModule>(x),
    mapA(takeLeft(1)),
    flattenA,
    flattenA,
    reduceA(0, (acc, v) => acc + v.length)
  )

  const {
    canStretchWidth,
    minWidth,
    maxWidth,
    gateLineX,
    sendWidthDrag,
    sendWidthDrop,
  } = useStretchWidth(buildingId, columnLayout)

  const rightHandleRef = useRef<Mesh>(null)
  const leftHandleRef = useRef<Mesh>(null)
  let widthHandleDragging = false
  const [widthGatesEnabled, setWidthGatesEnabled] = useState(false)

  const widthStretchHoverHandler: Handler<
    "hover",
    ThreeEvent<PointerEvent>
  > = ({ hovering }) => {
    if (widthHandleDragging) return
    if (!widthGatesEnabled && hovering) setWidthGatesEnabled(true)
    if (widthGatesEnabled && !hovering) setWidthGatesEnabled(false)
  }

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
        buildingId={buildingId}
        midColumns={midColumns}
        verticalCutPlanes={verticalCutPlanes}
      />
      <StretchedColumns
        {...{ endColumn, startColumn, vanillaPositionedRows }}
      />
      {canStretchWidth && (
        <Fragment>
          <StretchHandle
            ref={leftHandleRef}
            onHover={widthStretchHoverHandler}
            onDrag={({ first, last }) => {
              if (!leftHandleRef.current) return

              if (first) {
                widthHandleDragging = true
              }

              const [px] = rotateVector(pointer.xz)
              const [bx] = rotateVector([buildingX, buildingZ])

              const leftClamp = clamp(
                minWidth / 2 + handleOffset,
                maxWidth / 2 + handleOffset
              )

              const x = pipe(px - bx, leftClamp)

              leftHandleRef.current.position.x = x
              sendWidthDrag(x - handleOffset)

              if (last) {
                widthHandleDragging = false
                leftHandleRef.current.position.x = houseWidth / 2 + handleOffset
                sendWidthDrop()
              }
            }}
            position={[houseWidth / 2 + handleOffset, 0, houseLength / 2]}
          />
          <StretchHandle
            ref={rightHandleRef}
            onHover={widthStretchHoverHandler}
            onDrag={({ first, last }) => {
              if (!rightHandleRef.current) return

              if (first) {
                widthHandleDragging = true
              }

              const [px] = rotateVector(pointer.xz)
              const [bx] = rotateVector([buildingX, buildingZ])

              const rightClamp = clamp(
                -(maxWidth / 2 + handleOffset),
                -(minWidth / 2 + handleOffset)
              )

              const x = pipe(px - bx, rightClamp)

              rightHandleRef.current.position.x = x
              sendWidthDrag(x + handleOffset)

              if (last) {
                widthHandleDragging = false
                rightHandleRef.current.position.x = -(
                  houseWidth / 2 +
                  handleOffset
                )
                sendWidthDrop()
              }
            }}
            position={[-(houseWidth / 2 + handleOffset), 0, houseLength / 2]}
          />
          {widthGatesEnabled && (
            <group position={[0, 0, houseLength / 2]}>
              {[gateLineX, -gateLineX].map((x) => {
                return (
                  <mesh key={x} position={[x, 0, 0]} rotation-x={Math.PI / 2}>
                    <planeBufferGeometry args={[0.15, houseLength + 10]} />
                    <meshBasicMaterial color="white" side={DoubleSide} />
                  </mesh>
                )
              })}
            </group>
          )}
        </Fragment>
      )}
    </group>
  )
}

export default BuildingBuilding
