import Link from "next/link"
import { useRouter } from "next/router"
import React, { ReactNode } from "react"
import { iconButtonStyles } from "./IconButton"

type Props = {
  to: string
  children: ReactNode
}

const IconLink = (props: Props) => {
  const { pathname: location } = useRouter()

  const isActive = location.startsWith(props.to)
  return (
    <Link href={props.to}>
      <a className={`${iconButtonStyles} ${isActive ? "" : "opacity-50"}`}>
        {props.children}
      </a>
    </Link>
  )
}

export default IconLink
