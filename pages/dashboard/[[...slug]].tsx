import Dashboard from "@/components/dashboard"
import Layout from "@/components/layouts"
import { Loader } from "@/components/ui"
import Container from "@/components/ui/Container"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import React from "react"

const DashboardIndexPage = () => {
  return (
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
        <Dashboard />
      </SystemsDataProvider>
    </Layout>
  )
}

export default DashboardIndexPage
