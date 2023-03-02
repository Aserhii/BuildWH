import { IconButton } from "@/components/ui"
import { Build, Data, Site } from "@/components/ui/icons"
import React, { PropsWithChildren } from "react"

const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="fixed flex flex-col w-full h-full">
      <div className="absolute top-0 z-10 flex justify-center bg-white shadow left-1/2 -translate-x-1/2 transform">
        <IconButton href="/map">
          <Site />
        </IconButton>
        <IconButton href="/dashboard">
          <Data />
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
