import React, { useMemo, useEffect, useState } from "react"
import { useSystemsData, getHouseModules } from "@/data/system"
import { useHouses } from "@/stores/houses"
import Layout from "@/components/layouts"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import Container from "@/components/ui/Container"
import { Loader } from "@/components/ui"
import { type Houses } from "@/data/house"
import JSZip from "jszip"
import { CloudDownload24 } from "@carbon/icons-react"

const Download = () => {
  const systemsData = useSystemsData()
  const houses = useHouses() as Houses

  const housesWithModules = useMemo(() => {
    if (!systemsData || systemsData === "error") {
      return []
    }
    return Object.entries(houses).map(([houseId, house]) => ({
      houseId,
      house,
      houseModules: getHouseModules(house, systemsData),
    }))
  }, [houses, systemsData])

  const [zipUrl, setZipUrl] = useState<string>("")

  useEffect(() => {
    const zip = new JSZip()
    const housesFolder = zip.folder("houses")
    const toCsvLine = (vals: any[]) => vals.map((val) => `"${val}"`).join(",")
    housesWithModules.forEach(({ houseId, houseModules }) => {
      housesFolder?.file(
        `${houseId}.csv`,
        `${toCsvLine([
          "Code",
          "Width (m)",
          "Height (m)",
          "Length (m)",
          "Cost (EUR)",
          "Embodied carbon (kgCO₂e)",
        ])}\n${houseModules
          .map((module) =>
            toCsvLine([
              module.dna,
              module.width,
              module.height,
              module.length,
              module.cost,
              module.embodiedCarbon,
            ])
          )
          .join("\n")}`
      )
    })
    zip.generateAsync({ type: "base64" }).then((b64) => {
      const url = `data:application/zip;base64,${b64}`
      setZipUrl(url)
    })
  }, [housesWithModules])

  return (
    <div className="h-full w-full overflow-auto bg-gray-600 text-white">
      <div className="pt-16 pb-16">
        <a
          className="flex w-full items-center space-x-4 bg-gray-500 px-4 py-4 text-xs  no-underline transition-colors duration-200 hover:bg-gray-400"
          href={zipUrl}
        >
          <CloudDownload24 />
          <div>
            <p className="text-base">Download project data</p>
            <span className="text-sm text-gray-300">.csv</span>
          </div>
        </a>
      </div>
    </div>
  )
}

const DownloadPage = () => (
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
      <Download />
    </SystemsDataProvider>
  </Layout>
)

export default DownloadPage
