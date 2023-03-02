import Layout from "@/components/layouts"
import dynamic from "next/dynamic"
import { ReactElement } from "react"

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
})

const MapPage = () => {
  return <Map />
}

MapPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default MapPage
