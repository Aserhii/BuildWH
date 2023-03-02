import { Close } from "@/components/ui/icons"
import React, { type SetStateAction, type Dispatch, type FC } from "react"
import { type Houses } from "@/data/house"

interface Props {
  houses: Houses
  selectedHouses: string[]
  setSelectedHouses: Dispatch<SetStateAction<string[]>>
}

const HouseMultiSelect: FC<Props> = (props) => {
  const houseSelectOptions: { houseId: string; houseName: string }[] =
    Object.entries(props.houses)
      .map(([houseId, house]) =>
        props.selectedHouses.includes(houseId)
          ? null
          : {
              houseId,
              houseName: house.friendlyName,
            }
      )
      .filter((v): v is { houseId: string; houseName: string } => Boolean(v))

  return (
    <div className="flex flex-wrap items-center py-4 border-b border-gray-700 space-x-2">
      {houseSelectOptions.length > 0 ? (
        <>
          <div className="relative rounded cursor-auto hover:bg-gray-200">
            <span className="absolute cursor-auto pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              ▾
            </span>
            <input
              list="buildings"
              className="w-10 !cursor-default bg-transparent px-2 py-1 text-transparent"
              value=""
              onChange={(ev) => {
                const foundHouse = Object.entries(props.houses).find(
                  ([_houseId, house]) => house.friendlyName === ev.target.value
                )
                const houseId = foundHouse?.[0]
                if (!houseId) {
                  return null
                }
                props.setSelectedHouses((prev) => [...prev, houseId])
              }}
            />
          </div>
          <datalist id="buildings">
            {houseSelectOptions.map((houseSelectOption) => (
              <option
                key={houseSelectOption.houseId}
                value={houseSelectOption.houseName}
              />
            ))}
          </datalist>
        </>
      ) : (
        <span className="pointer-events-none inline-flex w-10 items-center justify-center rounded px-4 py-0.5 text-gray-400">
          ▾
        </span>
      )}
      {props.selectedHouses.map((houseId) => {
        const house = props.houses[houseId]
        if (!house) {
          return null
        }
        return (
          <p
            key={houseId}
            className="inline-flex items-center bg-white space-x-1"
          >
            <span className="inline-block py-1 pl-3">{house.friendlyName}</span>
            <button
              className="h-8 w-8 p-0.5 hover:bg-gray-50"
              onClick={() => {
                props.setSelectedHouses((prev) =>
                  prev.filter((id) => id !== houseId)
                )
              }}
            >
              <Close />
            </button>
          </p>
        )
      })}
    </div>
  )
}

export default HouseMultiSelect
