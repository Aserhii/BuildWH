import { IconButton } from "@/components/ui"
import { Build, Close, Data, Files, Info, Site } from "@/components/ui/icons"
import banners, { setBetaBanner, setPartnersInfoBanner } from "@/stores/banners"
import React, { PropsWithChildren } from "react"
import { useSnapshot } from "valtio"
import BetaBanner from "../ui/BetaBanner"
import PartnersInfoBanner from "../ui/PartnersInfoBanner"

const Layout = ({ children }: PropsWithChildren<{}>) => {
  const { betaBanner, partnersInfoBanner } = useSnapshot(banners)

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
          <IconButton href="/download">
            <Files />
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
