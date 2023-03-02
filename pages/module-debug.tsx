import ModuleDebug from "@/components/debug/ModuleDebug"
import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import { SiteContextMenu } from "@/components/site/menu"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment, Suspense } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const ModuleDebugPage = () => {
  useLocallyStoredHouses()

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
            <ModuleDebug />
          </SiteThreeInit>
        </SystemsDataProvider>
      </Layout>
      <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense>
    </Fragment>
  )
}

export default ModuleDebugPage
