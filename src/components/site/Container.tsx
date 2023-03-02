import type { ReactNode } from "react"
import React from "react"

interface Props {
  children?: ReactNode
}

const Container = ({ children }: Props) => (
  <div className="w-full h-full bg-gray-100 fixed flex justify-center items-center">
    {children}
  </div>
)

export default Container
