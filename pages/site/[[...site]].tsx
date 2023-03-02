import Layout from "@/components/layouts"
import Container from "@/components/site/Container"
import HtmlUi from "@/components/site/HtmlUi"
import SiteThreeApp from "@/components/site/SiteThreeApp"
import { Loader } from "@/components/ui"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const SiteIndexPage = () => {
  useLocallyStoredHouses()

  // const router = useRouter()

  // subscribe(context, () => {
  //   if (context.buildingId && !router.query.buildingId) {
  //     router.replace(
  //       router.pathname + `/building/${context.buildingId}`,
  //       undefined,
  //       { shallow: true }
  //     )
  //   }
  // })

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

SiteIndexPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default SiteIndexPage
