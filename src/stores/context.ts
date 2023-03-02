import { MutableRefObject } from "react"
import { Object3D } from "three"
import { proxy, useSnapshot } from "valtio"
import scope, { Scope } from "./scope"

type ContextProxy = {
  scope: Scope
  menu: [number, number] | null
  outlined: Array<MutableRefObject<Object3D | undefined>>
  pointer: [number, number]
}

const context = proxy<ContextProxy>({
  scope,
  menu: null,
  outlined: [],
  pointer: [0, 0],
})

export const useContext = () => useSnapshot(context)

export const setPointer = ([x, y]: [number, number]) => {
  context.pointer = [x, y]
}

export default context
