import siteContext, {
  enterBuildingMode,
  exitBuildingMode,
  SiteContextModeEnum,
  useProjectName,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import houses from "@/stores/houses"
import { useRoute } from "@/utils/wouter"
import { Fragment, useState } from "react"
import { Link } from "wouter"
import RenameForm from "../site/menu/RenameForm"

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
    className="mx-1 rounded-sm  p-1 text-lg font-bold"
  >
    {label}
  </Link>
)

const BreadcrumbsWithParams = (params: Params) => {
  const { buildingId, levelIndex } = params

  const { friendlyName } = houses[buildingId]

  const [renamingBuilding, setRenamingBuilding] = useState(false)

  const mode = useSiteContextMode()

  return (
    <Fragment>
      <span>{`/`}</span>
      <Breadcrumb
        path={`/site?buildingId=${buildingId}`}
        label={friendlyName}
        onClick={() => {
          switch (mode) {
            case SiteContextModeEnum.Enum.BUILDING:
              setRenamingBuilding(true)
              break
            case SiteContextModeEnum.Enum.LEVEL:
              enterBuildingMode(buildingId)
              break
          }
        }}
      />
      {renamingBuilding && (
        <RenameForm
          currentName={friendlyName}
          onNewName={(newName) => {
            if (newName.length > 0) houses[buildingId].friendlyName = newName
            setRenamingBuilding(false)
          }}
        />
      )}
      {typeof levelIndex !== "undefined" && (
        <Fragment>
          <span>{`/`}</span>
          <Breadcrumb
            path={`/site?buildingId=${buildingId}&levelIndex=${levelIndex}`}
            label={`Level ${levelIndex}`}
          />
        </Fragment>
      )}
    </Fragment>
  )
}

const Breadcrumbs = () => {
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  const mode = useSiteContextMode()

  const projectName = useProjectName()

  const [renamingProject, setRenamingProject] = useState(false)

  return (
    <div className="absolute top-0 left-0 m-1">
      <Breadcrumb
        path={`/site`}
        label={
          projectName === null || projectName.length === 0
            ? `New Project`
            : projectName
        }
        onClick={() => {
          if (mode !== SiteContextModeEnum.Enum.SITE) exitBuildingMode()
          else if (!renamingProject) setRenamingProject(true)
        }}
      />
      {renamingProject && (
        <RenameForm
          currentName={projectName}
          onNewName={(newName) => {
            if (newName.length > 0) siteContext.projectName = newName
            setRenamingProject(false)
          }}
        />
      )}
      {mode !== SiteContextModeEnum.Enum.SITE &&
        typeof params !== "boolean" &&
        params !== null &&
        "buildingId" in params && (
          <BreadcrumbsWithParams {...(params as Params)} />
        )}
    </div>
  )
}

export default Breadcrumbs
