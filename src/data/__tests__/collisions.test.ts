import {
  boundingBox,
  addNewPoint,
  checkRectangleIntersection,
} from "../collisions"

describe("boundingBox", () => {
  test("empty bounding box", () => {
    expect(boundingBox([])).toEqual(null)
  })
  // test("bounding box", () => {
  //   expect(
  //     boundingBox([
  //       [1, 2],
  //       [-3, 4],
  //     ])
  //   ).toEqual([
  //     [-3, 2],
  //     [1, 4],
  //   ]);
  // });
})

describe("checkRectangleIntersection", () => {
  test("no intersection", () => {
    expect(
      checkRectangleIntersection(
        {
          wx: 2,
          wy: 2,
          position: [0, 0],
          rotation: 0,
        },
        {
          wx: 2,
          wy: 2,
          position: [2.05, 0],
          rotation: 0,
        }
      )
    ).toEqual(false)
  })

  test("rotate to intersect", () => {
    expect(
      checkRectangleIntersection(
        {
          wx: 2,
          wy: 2,
          position: [0, 0],
          rotation: 0,
        },
        {
          wx: 2,
          wy: 2,
          position: [2.05, 0],
          rotation: Math.PI / 4,
        }
      )
    ).toEqual(true)
  })
})

describe("addNew", () => {
  test("add to empty point cloud", () => {
    expect(addNewPoint([])).toEqual([0, 0])
  })
  // test("add to a non-empty point cloud", () => {
  //   expect(addNewPoint([[10, 0]])).toEqual([20, 10]);
  // });
})
