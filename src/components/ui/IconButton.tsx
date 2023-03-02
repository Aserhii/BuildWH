import React, { FC } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
// import { Link, useLocation } from "react-router-dom";

export interface Props {
  onClick?: () => void
  href?: string
}

const className =
  "w-12 inline-block h-12 hover:bg-[rgba(0,0,0,0.1)] transition-colors duration-200 ease-in-out focus:outline-none focus:shadow-[0 0 0 3px rgba(0,0,0,0.2))]"

const IconButton: FC<Props> = (props) => {
  const router = useRouter()
  // const location = useLocation();
  if (props.href) {
    const isActive = router.pathname.startsWith(props.href)
    return (
      <Link href={props.href}>
        <a className={`${className} ${isActive ? "" : "opacity-50"}`}>
          <div>{props.children}</div>
        </a>
      </Link>
    )
  }
  return (
    <button className={className} onClick={props.onClick}>
      {props.children}
    </button>
  )
}

export default IconButton
