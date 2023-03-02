import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import SiteThreeApp from "@/components/site/SiteThreeApp"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredContext } from "@/stores/context"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const SiteIndexPage = () => {
  useLocallyStoredHouses()
  useLocallyStoredContext()

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
          <SiteThreeInit>
            <SiteThreeApp />
          </SiteThreeInit>
          <HtmlUi />
        </SystemsDataProvider>
      </Layout>
    </Fragment>
  )
}

export default SiteIndexPage
