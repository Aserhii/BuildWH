import Sidebar from "@/components/ui/Sidebar"
import { useSystemsData } from "@/contexts/SystemsData"
import { addNewPoint } from "@/data/collisions"
import { System, systems } from "@/data/system"
import houses from "@/stores/houses"
import { pipe } from "fp-ts/lib/function"
import { mapWithIndex } from "fp-ts/lib/ReadonlyArray"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import { nanoid } from "nanoid"
import React, { useMemo, useState } from "react"
import HouseThumbnail from "./HouseThumbnail"

type Props = {
  open: boolean
  close: () => void
}

const SiteSidebar = ({ open, close }: Props) => {
  const manySystems = systems.length > 1
  const singleSystem = systems.length === 1

  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(
    singleSystem ? systems[0].id : null
  )

  const selectedSystem: System | undefined = useMemo(() => {
    return systems.find((system) => system.id === selectedSystemId)
  }, [selectedSystemId])

  const { houseTypes } = useSystemsData()

  return (
    <Sidebar expanded={open} onClose={close}>
      {manySystems && !selectedSystem ? (
        <div className="space-y-2">
          <p className="px-4 font-bold">Systems</p>
          {systems.map((system) => (
            <button
              key={system.id}
              className="block w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => {
                setSelectedSystemId(system.id)
              }}
            >
              {system.name}
            </button>
          ))}
        </div>
      ) : (
        selectedSystem && (
          <div className="space-y-2">
            {manySystems && (
              <button
                className="sticky top-2 ml-4 rounded bg-white px-2 py-2 text-xs text-gray-500 hover:text-gray-600"
                onClick={() => {
                  setSelectedSystemId(null)
                }}
              >
                ← Back
              </button>
            )}
            <p className="px-4 font-bold">{selectedSystem.name} House types</p>
            {pipe(
              houseTypes,
              mapWithIndex((index, houseType) => {
                return houseType.systemId === selectedSystem.id ? (
                  <HouseThumbnail
                    key={index}
                    houseType={houseType}
                    onAdd={() => {
                      const id = nanoid()

                      const housePositions = Object.values(houses).map(
                        (house) => house.position
                      )

                      const position = addNewPoint(housePositions)

                      houses[id] = {
                        id,
                        houseTypeId: houseType.id,
                        systemId: houseType.systemId,
                        position,
                        rotation: 0,
                        dna: houseType.dna as string[],
                        modifiedMaterials: {},
                        modifiedMaterialsPreview: {},
                        friendlyName: `Building ${keys(houses).length + 1}`,
                      }
                      close()
                    }}
                  />
                ) : null
              })
            )}
          </div>
        )
      )}
    </Sidebar>
  )
}

export default SiteSidebar
