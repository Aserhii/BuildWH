import Layout from "@/components/layouts"
import HtmlUi from "@/components/site/HtmlUi"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import { Fragment, Suspense } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const IfcApp = dynamic(() => import("@/components/ifc/IfcApp"), {
  ssr: false,
})

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
          <SiteThreeInit>
            <Suspense fallback={null}>
              <IfcApp />
            </Suspense>
          </SiteThreeInit>
          <HtmlUi />
        </SystemsDataProvider>
      </Layout>
    </Fragment>
  )
}

export default SiteIndexPage
