import { IconButton } from "@/components/ui"
import { Build, Site } from "@/components/ui/icons"
import React, { PropsWithChildren } from "react"

const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="fixed flex h-full w-full flex-col">
      <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 transform justify-center bg-white shadow">
        <IconButton href="/map">
          <Site />
        </IconButton>
        <IconButton href="/site">
          <Build />
        </IconButton>
      </div>
      {children}
    </div>
  )
}

export default Layout
