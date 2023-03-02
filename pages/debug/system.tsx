import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import Leva from "@/components/ui/Leva"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import dynamic from "next/dynamic"
import React, { Fragment } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const DebugSystem = dynamic(() => import("@/components/debug/DebugSystem"), {
  ssr: false,
})

const DebugSystemPage = () => {
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
            <DebugSystem />
          </SiteThreeInit>
        </SystemsDataProvider>
        <Leva />
      </Layout>
    </Fragment>
  )
}

export default DebugSystemPage
