import SiteSidebar from "@/components/site/SiteSidebar"
import {
  Breadcrumbs,
  Checklist,
  IconButton,
  IconMenu,
  Loader,
  Radio,
} from "@/components/ui"
import { Check, Menu, SectionCuts } from "@/components/ui/icons"
import { useCameraReset } from "@/stores/camera"
import siteContext, { useSiteContext } from "@/stores/context"
import {
  setOrthographic,
  useSettings,
  useShadows,
  useVerticalCuts,
} from "@/stores/settings"
import { filterR } from "@/utils"
import { Add32, Reset24, View24 } from "@carbon/icons-react"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/Record"
import React, { Fragment, Suspense, useState } from "react"
import UniversalMenu from "../ui/UniversalMenu"
import { SiteContextMenu } from "./menu"
import SiteMetrics from "./SiteMetrics"

const HtmlUi = () => {
  const [houseTypeMenu, setHouseTypeMenu] = useState(false)
  const [universalMenu, setUniversalMenu] = useState(false)

  const { orthographic } = useSettings()

  const [shadows, setShadows] = useShadows()

  const { buildingId, levelIndex, editMode } = useSiteContext()

  const check = buildingId !== null || levelIndex !== null || editMode !== null

  const onCheck = () => {
    if (levelIndex !== null) {
      siteContext.levelIndex = null
    } else if (buildingId !== null) {
      siteContext.buildingId = null
      siteContext.editMode = null
    } else if (editMode !== null) {
      siteContext.editMode = null
    }
  }

  const [verticalCuts, setVerticalCuts] = useVerticalCuts()

  const cameraReset = useCameraReset()

  return (
    <Fragment>
      <div className="absolute top-0 right-0 z-10 flex items-center justify-center">
        <IconButton onClick={() => setHouseTypeMenu(true)}>
          <div className="flex items-center justify-center">
            <Add32 />
          </div>
        </IconButton>
        <IconButton onClick={() => setUniversalMenu(true)}>
          <Menu />
        </IconButton>
      </div>
      <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 transform flex-col justify-center bg-white shadow">
        <IconMenu icon={() => <View24 className="m-auto" />}>
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
          <IconButton onClick={cameraReset}>
            <Reset24 className="m-auto" />
          </IconButton>
        </IconMenu>
        <IconMenu icon={SectionCuts}>
          <Checklist
            label="Vertical cuts"
            options={[
              { value: "width", label: "Width" },
              { value: "length", label: "Length" },
            ]}
            selected={pipe(
              verticalCuts,
              filterR((x) => x),
              keys
            )}
            onChange={setVerticalCuts}
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
        </IconMenu>
      </div>
      <Suspense fallback={<Loader />}>
        <SiteSidebar
          open={houseTypeMenu}
          close={() => setHouseTypeMenu(false)}
        />
      </Suspense>
      <UniversalMenu
        open={universalMenu}
        close={() => setUniversalMenu(false)}
      />
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
