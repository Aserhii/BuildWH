import context from "@/stores/context"
import houses, { useHouse } from "@/stores/houses"
import { useRoute } from "@/utils/wouter"
import React from "react"
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
    className="mr-4 rounded-md border border-black bg-white p-1"
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
          context.buildingId = null
          context.levelIndex = null
        }}
      />
      <Breadcrumb
        path={`/site?buildingId=${buildingId}`}
        label={friendlyName}
        onClick={() => {
          context.levelIndex = null
        }}
      />
      {levelIndex && (
        <Breadcrumb
          path={`/site?buildingId=${buildingId}&levelIndex=${levelIndex}`}
          label={`Level ${levelIndex}`}
        />
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
