import { MutableRefObject } from "react"
import { Object3D } from "three"
import { proxy, useSnapshot } from "valtio"
import * as z from "zod"
import scope, { Scope } from "./scope"

export const EditModeEnum = z.enum(["MOVE", "ROTATE", "STRETCH"])
export type EditMode = z.infer<typeof EditModeEnum>

type ContextProxy = {
  scope: Scope
  menu: [number, number] | null
  outlined: Array<MutableRefObject<Object3D | undefined>>
  pointer: [number, number]
  buildingId: string | null
  editMode: EditMode | null
}

const context = proxy<ContextProxy>({
  scope,
  menu: null,
  outlined: [],
  pointer: [0, 0],
  buildingId: null,
  editMode: null,
})

export const useContext = () => useSnapshot(context)

export const setPointer = ([x, y]: [number, number]) => {
  context.pointer = [x, y]
}

export default context
