import SiteSidebar from "@/components/site/SiteSidebar"
import { IconButton, IconMenu, Loader, Radio } from "@/components/ui"
import { Check, Environment, Menu } from "@/components/ui/icons"
import context, { useContext } from "@/stores/context"
import { setOrthographic, useSettings } from "@/stores/settings"
import React, { Fragment, Suspense, useState } from "react"
import Breadcrumbs from "../ui/Breadcrumbs"
import { SiteContextMenu } from "./menu"
import SiteMetrics from "./SiteMetrics"

const HtmlUi = () => {
  const [sidebar, setSidebar] = useState(false)
  const { orthographic } = useSettings()
  const { buildingId, levelIndex, editMode } = useContext()

  const check = buildingId !== null || levelIndex !== null || editMode !== null

  const onCheck = () => {
    if (levelIndex !== null) {
      context.levelIndex = null
    } else if (buildingId !== null) {
      context.buildingId = null
    } else if (editMode !== null) {
      context.editMode = null
    }
  }

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
      </div>
      <Suspense fallback={<Loader />}>
        <SiteSidebar open={sidebar} close={() => setSidebar(false)} />
      </Suspense>
      {check ? (
        <div className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 transform justify-center">
          <button
            onClick={onCheck}
            className="block h-12 w-12 rounded-full bg-white p-2 text-green-500 shadow-lg hover:bg-gray-100"
          >
            <Check />
          </button>
        </div>
      ) : null}
      <Breadcrumbs />
      <SiteContextMenu />
      <SiteMetrics />
    </Fragment>
  )
}
export default HtmlUi
