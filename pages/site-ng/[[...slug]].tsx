import Layout from "@/components/layouts"
import SiteNgApp from "@/components/site-ng/SiteNgApp"
import HtmlUi from "@/components/site/HtmlUi"
import SiteThreeApp from "@/components/site/SiteThreeApp"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment } from "react"

const SiteNgInit = dynamic(() => import("@/components/site-ng/SiteNgInit"))

const SiteIndexPage = () => {
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
          <SiteNgInit>
            <SiteNgApp />
          </SiteNgInit>
          <HtmlUi />
        </SystemsDataProvider>
      </Layout>
    </Fragment>
  )
}

export default SiteIndexPage
