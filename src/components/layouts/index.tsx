import { IconButton } from "@/components/ui"
import { Build, Close, Data, Info, Site } from "@/components/ui/icons"
import React, { PropsWithChildren, useEffect, useState } from "react"
import BetaBanner from "../ui/BetaBanner"
import PartnersInfoBanner from "../ui/PartnersInfoBanner"

const Layout = ({ children }: PropsWithChildren<{}>) => {
  const [partnersInfoBanner, setPartnersInfoBanner] = useState(false)
  const [betaBanner, setBetaBanner] = useState(true)

  useEffect(() => void console.log(partnersInfoBanner), [partnersInfoBanner])

  return (
    <div className="fixed flex h-full w-full flex-col">
      <div>
        {betaBanner && (
          <BetaBanner
            className="flex-none"
            onClose={() => setBetaBanner(false)}
          />
        )}
      </div>
      <div className="relative h-full w-full">
        <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 transform justify-center bg-white shadow">
          <IconButton href="/map">
            <Site />
          </IconButton>
          <IconButton href="/site">
            <Build />
          </IconButton>
          <IconButton href="/dashboard">
            <Data />
          </IconButton>
        </div>
        <PartnersInfoBanner
          expanded={partnersInfoBanner}
          onClose={() => {
            setPartnersInfoBanner(false)
          }}
        />
        <div className="absolute left-0 bottom-6 z-20">
          <IconButton
            onClick={(e: any) => {
              e.stopPropagation()
              setPartnersInfoBanner((p) => !p)
            }}
          >
            {partnersInfoBanner ? <Close /> : <Info />}
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Layout
