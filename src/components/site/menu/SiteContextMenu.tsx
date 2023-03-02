import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import { useSystemsData } from "@/contexts/SystemsData"
import { House } from "@/data/house"
import siteContext, {
  EditModeEnum,
  enterBuildingMode,
  exitBuildingMode,
  useSiteContext,
} from "@/stores/context"
import { exportGLB } from "@/stores/events"
import houses, { useHouse } from "@/stores/houses"
import { closeMenu } from "@/stores/menu"
import scope, { ScopeItem } from "@/stores/scope"
import { Fragment, useState } from "react"
import { useSnapshot } from "valtio"
import BuildingContextMenu from "./BuildingContextMenu"
import LevelContextMenu from "./LevelContextMenu"
import RenameForm from "./RenameForm"

const SiteContextMenu_ = (props: ContextMenuProps) => {
  const { selected } = props

  const { buildingId } = selected

  const house = useHouse(buildingId) as House

  const { houseTypes } = useSystemsData()

  const resetBuilding = () => {
    const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
    if (houseType) {
      houses[buildingId].dna = houseType.dna as string[]
      houses[buildingId].modifiedMaterials = {}
      houses[buildingId].rotation = 0
    }
    props.onClose?.()
  }

  const deleteBuilding = () => {
    delete houses[buildingId]
    scope.selected = null
    if (Object.keys(houses).length === 0) {
      exitBuildingMode()
    }
    props.onClose?.()
  }

  const [renaming, setRenaming] = useState(false)

  const rename = () => setRenaming(true)

  const editBuilding = () => {
    enterBuildingMode(house.id)
    props?.onClose?.()
  }

  const moveRotate = () => {
    siteContext.editMode = EditModeEnum.Enum.MOVE_ROTATE
    props.onClose?.()
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>{house.friendlyName}</ContextMenuHeading>
      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetBuilding}>Reset</ContextMenuButton>
          <ContextMenuButton onClick={deleteBuilding}>Delete</ContextMenuButton>
          <ContextMenuButton onClick={editBuilding}>
            {`Edit building`}
          </ContextMenuButton>
          <ContextMenuButton onClick={moveRotate}>
            {`Move/rotate building`}
          </ContextMenuButton>
        </Fragment>
      )}

      <Fragment>
        <ContextMenuButton onClick={rename} className="focus:outline-none">
          {`Rename building`}
        </ContextMenuButton>
        {renaming && (
          <RenameForm
            {...props}
            currentName={house.friendlyName}
            onNewName={(newName) => {
              houses[buildingId].friendlyName = newName
              setRenaming(false)
            }}
          />
        )}
      </Fragment>

      {!renaming && (
        <Fragment>
          <ContextMenuButton onClick={resetBuilding}>
            {`Reset building`}
          </ContextMenuButton>
          <ContextMenuButton onClick={deleteBuilding}>
            {`Delete building`}
          </ContextMenuButton>
        </Fragment>
      )}

      <ContextMenuButton onClick={() => void exportGLB(buildingId)}>
        Export GLB
      </ContextMenuButton>
    </ContextMenu>
  )
}

const SiteContextMenu = ({ x: pageX, y: pageY }: { x: number; y: number }) => {
  const { buildingId, levelIndex } = useSiteContext()
  const { selected } = useSnapshot(scope)

  const props = {
    pageX,
    pageY,
    onClose: closeMenu,
    selected: selected as ScopeItem,
  }

  return selected === null ? null : (
    <div>
      {!buildingId ? (
        <SiteContextMenu_ {...props} />
      ) : levelIndex === null ? (
        <BuildingContextMenu {...props} />
      ) : (
        <LevelContextMenu {...props} />
      )}
    </div>
  )
}

export default SiteContextMenu
