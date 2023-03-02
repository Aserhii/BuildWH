import ModuleDebug from "@/components/debug/ModuleDebug"
import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const HouseTypeDebugPage = () => {
  useLocallyStoredHouses()

  return (
    <Fragment>
      <Layout>
        <HtmlUi />
        <SiteThreeInit>
          <ModuleDebug />
        </SiteThreeInit>
      </Layout>
      {/* <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense> */}
    </Fragment>
  )
}

HouseTypeDebugPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default HouseTypeDebugPage
