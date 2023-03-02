// This is necessary because more modern `nanoid` versions that include types
// conflict with the version requirements of Mapbox. Hence we're using nanoid@2.x.x,

// which doesn't have typings.
declare module "nanoid"
declare module "postprocessing"

type Pt3 = [number, number, number]

type Pt2 = [number, number]

type V6 = [number, number, number, number, number, number]
