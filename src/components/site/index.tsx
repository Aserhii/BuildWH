import Layout from "@/components/layouts"
import { SiteContextMenu } from "@/components/menu"
import SiteSidebar from "@/components/site/SiteSidebar"
import { IconButton, IconMenu, Loader, Radio } from "@/components/ui"
import { Check, Environment, Menu } from "@/components/ui/icons"
import context, { useContext } from "@/stores/context"
import { useLocallyStoredHouses } from "@/stores/houses"
import { setOrthographic, useSettings } from "@/stores/settings"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement, Suspense, useState } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const HtmlUi = () => {
  const [sidebar, setSidebar] = useState(false)
  const { orthographic } = useSettings()
  const { buildingId } = useContext()
  const buildingMode = buildingId !== null

  return (
    <Fragment>
      <div className="absolute top-0 right-0 z-10">
        <IconButton onClick={() => setSidebar(true)}>
          <Menu />
        </IconButton>
      </div>
      <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 transform flex-col justify-center bg-white shadow">
        <IconMenu icon={Environment}>
          <Radio
            id="camera"
            label="Camera"
            options={[
              {
                label: "Perspective",
                value: false,
              },
              {
                label: "Orthographic",
                value: true,
              },
            ]}
            selected={orthographic}
            onChange={setOrthographic}
          />
        </IconMenu>
      </div>
      <Suspense fallback={<Loader />}>
        <SiteSidebar open={sidebar} close={() => setSidebar(false)} />
      </Suspense>
      {buildingMode ? (
        <div className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 transform justify-center">
          <button
            onClick={() => void (context.buildingId = null)}
            className="block h-12 w-12 rounded-full bg-white p-2 text-green-500 shadow-lg hover:bg-gray-100"
          >
            <Check />
          </button>
        </div>
      ) : null}
    </Fragment>
  )
}

const SiteIndex = () => {
  useLocallyStoredHouses()

  return (
    <Fragment>
      <Layout>
        <HtmlUi />
        <SiteThreeInit />
      </Layout>
      <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense>
    </Fragment>
  )
}

SiteIndex.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default SiteIndex
