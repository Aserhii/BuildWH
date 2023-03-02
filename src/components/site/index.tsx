import { useLocallyStoredHouses } from "@/stores/houses"
import { ScopeType, ScopeTypeEnum, setScopeType } from "@/stores/scope"
import settings, { setOrthographic } from "@/stores/settings"
import { upperFirst } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import { map } from "fp-ts/lib/ReadonlyArray"
import { toLowerCase } from "fp-ts/lib/string"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement, Suspense, useState } from "react"
import { useSnapshot } from "valtio"
import Layout from "@/components/layouts"
import { IconButton, IconMenu, Loader, Radio } from "@/components/ui"
import { Crosshair, Environment, Menu } from "@/components/ui/icons"
import { SiteContextMenu } from "@/components/site/menu"
import SiteSidebar from "@/components/site/SiteSidebar"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const SiteIndex = () => {
  const [sidebar, setSidebar] = useState(false)
  const {
    orthographic,
    scope: { type: scopeType },
  } = useSnapshot(settings)

  useLocallyStoredHouses()

  return (
    <Fragment>
      <div className="absolute top-0 right-0 z-10">
        <IconButton onClick={() => setSidebar(true)}>
          <Menu />
        </IconButton>
      </div>
      <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 transform flex-col justify-center bg-white shadow">
        <IconMenu icon={Environment}>
          <Radio
            id="camera"
            label="Camera"
            options={[
              {
                label: "Perspective",
                value: false,
              },
              {
                label: "Orthographic",
                value: true,
              },
            ]}
            selected={orthographic}
            onChange={setOrthographic}
          />
        </IconMenu>
        <IconMenu icon={Crosshair}>
          <Radio
            id="scope"
            label="Scope"
            options={pipe(
              ScopeTypeEnum.options,
              map((value) => ({
                label: pipe(
                  value,
                  toLowerCase,
                  upperFirst,
                  getOrElse(() => ScopeTypeEnum.enum.HOUSE)
                ),
                value,
              }))
            )}
            selected={scopeType as ScopeType}
            onChange={setScopeType}
          />
        </IconMenu>
        {/* <IconMenu icon={SectionCuts}>
          <Checklist
            label="Section cuts"
            options={[
              { value: "short", label: "Short" },
              { value: "long", label: "Long" },
              { value: "horizontal", label: "Horizontal" },
            ]}
            selected={sectionCuts}
            onChange={setSectionCuts}
          />
          <Radio
            id="ground-plane"
            label="Ground Plane"
            options={[
              { value: false, label: "None" },
              { value: true, label: "Regular" },
            ]}
            selected={shadows}
            onChange={(newValue) => {
              setShadows(newValue)
            }}
          />
        </IconMenu> */}
      </div>
      <Suspense fallback={<Loader />}>
        <SiteSidebar open={sidebar} close={() => setSidebar(false)} />
      </Suspense>
      <Layout>
        {/* <ThreeInit /> */}
        <SiteThreeInit />
      </Layout>
      <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense>
    </Fragment>
  )
}

SiteIndex.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default SiteIndex
