import { store, useHouseType } from "."

export const useResetHouse = (houseId: string) => {
  const houseType = useHouseType(houseId)

  return () => {
    store.houses[houseId].dna = houseType.dna as string[]
  }
}

export const useHouseActions = () => {}
export const useHousesActions = () => {}

export const useLevelActions = () => {}
export const useLevelsActions = () => {}
