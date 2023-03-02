import React from "react"
import type { HTMLProps } from "react"
// import { Link } from "wouter";
import Link from "next/link"

export interface Props extends HTMLProps<HTMLElement> {
  to?: string
}

const className =
  "py-2 px-3 block hover:bg-gray-100 w-full text-left text-sm whitespace-pre"

export default function ContextMenuButton(props: Props) {
  const { to, children, ...rest } = props
  return to ? (
    <Link href={to} {...(rest as any)}>
      <a className={className}>{children}</a>
    </Link>
  ) : (
    <button className={className} {...(rest as any)}>
      {children}
    </button>
  )
}
