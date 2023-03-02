import { Close } from "@/components/ui/icons"
import React, {
  type SetStateAction,
  type Dispatch,
  type FC,
  useState,
  useRef,
  useCallback,
} from "react"
import { type Houses } from "@/data/house"
import { colorScheme } from "./Ui"
import { useClickAway } from "@/components/ui/utils"

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

  const [expanded, setExpanded] = useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const closeDropdown = useCallback(() => {
    setExpanded(false)
  }, [setExpanded])

  useClickAway(dropdownRef, closeDropdown)

  if (Object.values(props.houses).length === 0) {
    return <p className="px-4 py-2 text-white">No houses available.</p>
  }

  return (
    <div className="flex flex-wrap items-center px-4 space-x-2">
      {props.selectedHouses.map((houseId, index) => {
        const house = props.houses[houseId]
        if (!house) {
          return null
        }
        return (
          <p
            key={houseId}
            className="inline-flex items-center overflow-hidden rounded-full space-x-1"
            style={{ backgroundColor: colorScheme[index] }}
          >
            <span className="inline-block py-1 pl-3">{house.friendlyName}</span>
            <button
              className="h-8 w-8 p-0.5 transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)]"
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

      {houseSelectOptions.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            className="w-10 py-1 text-2xl leading-none text-center text-white text-gray-400 transition-colors duration-200 hover:text-white"
            onClick={() => {
              setExpanded((prev) => !prev)
            }}
          >
            +
          </button>

          {expanded && (
            <div
              className={`absolute -bottom-1 z-40 w-40 translate-y-full transform overflow-hidden rounded bg-white shadow-lg ${
                props.selectedHouses.length > 0 ? "right-0" : "left-0"
              }`}
            >
              {houseSelectOptions.map((houseSelectOption) => (
                <button
                  className="block w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-gray-100"
                  key={houseSelectOption.houseId}
                  onClick={() => {
                    props.setSelectedHouses((prev) => [
                      ...prev,
                      houseSelectOption.houseId,
                    ])
                  }}
                  value={houseSelectOption.houseName}
                >
                  {houseSelectOption.houseName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HouseMultiSelect
