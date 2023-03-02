import { proxy, useSnapshot } from "valtio"
import * as z from "zod"
import scopes, { Scopes } from "./scope"

export const EditModeEnum = z.enum(["MOVE", "ROTATE", "STRETCH"])
export type EditMode = z.infer<typeof EditModeEnum>

type ContextProxy = {
  scopes: Scopes
  menu: [number, number] | null
  pointer: [number, number]
  buildingId: string | null
  levelIndex: number | null
  editMode: EditMode | null
}

const context = proxy<ContextProxy>({
  scopes,
  menu: null,
  pointer: [0, 0],
  buildingId: null,
  levelIndex: null,
  editMode: null,
})

export const useContext = () => useSnapshot(context)

export const setPointer = ([x, y]: [number, number]) => {
  context.pointer = [x, y]
}

// export const outlineMesh = (
//   meshRef: MutableRefObject<Object3D | undefined>
// ) => {
//   context.outlined.push(ref(meshRef))
// }

// export const removeMeshOutline = (
//   meshRef: MutableRefObject<Object3D | undefined>
// ) => {
//   context.outlined = context.outlined.filter(
//     (x) => x?.current && meshRef?.current && x.current.id !== meshRef.current.id
//   )
// }

export default context
