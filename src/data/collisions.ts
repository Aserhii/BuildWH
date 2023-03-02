import { pipe } from "fp-ts/lib/function"
import { reduce } from "fp-ts/lib/ReadonlyArray"
import { Box3, Vector3, Matrix4 } from "three"

const minPt2 = ([x1, y1]: Pt2, [x2, y2]: Pt2): Pt2 => {
  return [Math.min(x1, x2), Math.min(y1, y2)]
}

const maxPt2 = ([x1, y1]: Pt2, [x2, y2]: Pt2): Pt2 => {
  return [Math.max(x1, x2), Math.max(y1, y2)]
}

export const boundingBox = (points: Array<Pt2>): [Pt2, Pt2] | null => {
  if (points.length === 0) {
    return null
  }
  return pipe(
    points,
    reduce(
      [
        [Infinity, Infinity],
        [-Infinity, -Infinity],
      ],
      ([currentMin, currentMax], currentPt) => [
        minPt2(currentMin, currentPt),
        maxPt2(currentMax, currentPt),
      ]
    )
  )
}

export interface Rectangle {
  wx: number
  wy: number
  position: [number, number]
  rotation: number
}

const getMatrix = ({
  position,
  rotation,
}: {
  position: [number, number]
  rotation: number
}) => {
  const translationMatrix = new Matrix4().makeTranslation(
    position[0],
    0,
    position[1]
  )
  const rotationMatrix = new Matrix4().makeRotationY(rotation)
  return translationMatrix.multiply(rotationMatrix)
}

export const checkRectangleIntersection = (
  rect1: Rectangle,
  rect2: Rectangle
): boolean => {
  const box1 = new Box3(
    new Vector3(-rect1.wx / 2, 0, -rect1.wy / 2),
    new Vector3(rect1.wx / 2, 1, rect1.wy / 2)
  )
  box1.applyMatrix4(getMatrix(rect1))

  const box2 = new Box3(
    new Vector3(-rect1.wx / 2, 0, -rect1.wy / 2),
    new Vector3(rect1.wx / 2, 1, rect1.wy / 2)
  )
  box2.applyMatrix4(getMatrix(rect2))

  return box1.intersectsBox(box2)
}

export const addNewPoint = (points: Array<Pt2>): Pt2 => {
  const bb = boundingBox(points)
  if (!bb) {
    return [0, 0]
  }
  return [bb[1][0] + 10, bb[1][1] + 10]
}
