import DebugHouseType from "@/components/debug/DebugHouseType"
import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import { SiteContextMenu } from "@/components/site/menu"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import Leva from "@/components/ui/Leva"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import dynamic from "next/dynamic"
import React, { Fragment, Suspense } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const ModuleDebugPage = () => {
  return (
    <Fragment>
      <Layout>
        <SystemsDataProvider
          onError={
            <Container>
              <p>Something went wrong.</p>
            </Container>
          }
          onLoading={
            <Container>
              <Loader />
            </Container>
          }
        >
          <HtmlUi />
          <SiteThreeInit>
            <DebugHouseType />
          </SiteThreeInit>
        </SystemsDataProvider>
        <Leva />
      </Layout>
      <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense>
    </Fragment>
  )
}

export default ModuleDebugPage
