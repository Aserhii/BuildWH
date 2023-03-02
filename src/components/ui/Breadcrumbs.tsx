import siteContext from "@/stores/context"
import houses, { useHouse } from "@/stores/houses"
import { useRoute } from "@/utils/wouter"
import React, { Fragment } from "react"
import { Link } from "wouter"

type BreadcrumbProps = {
  path: string
  label: string
  onClick?: () => void
}

type Params = {
  buildingId: string
  levelIndex?: string
}

const Breadcrumb = ({ path, label, onClick }: BreadcrumbProps) => (
  <Link
    href={path}
    onClick={onClick}
    className="m-1 rounded-sm bg-white p-1 hover:bg-gray-300"
  >
    {label}
  </Link>
)

const BreadcrumbsWithParams = (params: Params) => {
  const { buildingId, levelIndex } = params

  const { friendlyName } = houses[buildingId]

  return (
    <div className="absolute top-0 left-0">
      <Breadcrumb
        path={`/site`}
        label="Site"
        onClick={() => {
          siteContext.buildingId = null
          siteContext.levelIndex = null
        }}
      />
      <span>{`/`}</span>
      <Breadcrumb
        path={`/site?buildingId=${buildingId}`}
        label={friendlyName}
        onClick={() => {
          siteContext.levelIndex = null
        }}
      />
      {levelIndex && (
        <Fragment>
          <span>{`/`}</span>
          <Breadcrumb
            path={`/site?buildingId=${buildingId}&levelIndex=${levelIndex}`}
            label={`Level ${levelIndex}`}
          />
        </Fragment>
      )}
    </div>
  )
}

const Breadcrumbs = () => {
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  return typeof params === "boolean" ||
    params === null ||
    !("buildingId" in params) ? null : (
    <BreadcrumbsWithParams {...(params as Params)} />
  )
}

export default Breadcrumbs
