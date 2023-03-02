import { Radio } from "@/components/ui"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { useSystemsData } from "@/contexts/SystemsData"
import houses, { useHouse, useHouseType } from "@/stores/houses"
import { mapO } from "@/utils"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import React from "react"

const ChangeMaterials = ({
  buildingId,
  elementName,
}: {
  buildingId: string
  elementName: string
}) => {
  const { elements, materials } = useSystemsData()

  const house = useHouse(buildingId)
  const houseType = useHouseType(buildingId)

  return pipe(
    elements,
    findFirst((x) => x.name === elementName),
    mapO((element) => {
      const thumbnailsByMaterial = element
        ? (() => {
            const record: Record<string, string> = {}
            materials.forEach((material) => {
              if (
                material.systemId === houseType.systemId &&
                element.materialOptions.includes(material.name)
              ) {
                record[material.name] = material.textureUrl
              }
            })
            return record
          })()
        : {}

      const options = element.materialOptions.map((option) => ({
        label: option,
        value: option,
        thumbnail: thumbnailsByMaterial[option],
      }))

      return options.length < 1 ? null : (
        <ContextMenuNested label={`Change ${elementName} Material`}>
          <Radio
            options={options}
            selected={
              house.modifiedMaterials?.[element.name] ?? element.defaultMaterial
            }
            onChange={(newMaterial) => {
              houses[buildingId].modifiedMaterials = {
                ...(house.modifiedMaterials ?? {}),
                [element.name]: newMaterial,
              }
            }}
          />
        </ContextMenuNested>
      )
    }),
    toNullable
  )
}

export default ChangeMaterials
