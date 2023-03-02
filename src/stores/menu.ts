import { proxy } from "valtio"

const menu = proxy({
  open: false,
  x: 0,
  y: 0,
})

export const openMenu = (x: number, y: number) => {
  menu.open = true
  menu.x = x
  menu.y = y
}

export const closeMenu = () => {
  menu.open = false
}

export default menu
