import { System } from "@/data/system"
import { getAirtableEntries } from "./utils"

export interface HouseType {
  id: string
  systemId: string
  name: string
  dna: Array<string>
  imageUrl: string
  cost: number
  carbon: number
}

export const getHouseTypes = async (
  system: System
): Promise<Array<HouseType>> => {
  try {
    const modulesByHouseType: Array<any> = (
      await getAirtableEntries({
        tableId: system.airtableId,
        tab: "modules_by_housetype",
      })
    ).records
    const houseTypes = (
      await getAirtableEntries({
        tableId: system.airtableId,
        tab: "house_types",
      })
    ).records.map((record: any) => {
      const processedModules = record.fields["modules"]
        .map((modulesByHouseTypeId: string) => {
          // Find module record ID in the modules_by_housetype junction table
          const moduleByHouseType = modulesByHouseType.find(
            (m) => m.id === modulesByHouseTypeId
          )
          return moduleByHouseType?.fields["module_code"]?.[0]
        })
        .filter((code: string | undefined) => Boolean(code))
      return {
        id: record.id,
        systemId: system.id,
        name: record.fields?.["house_type_code"],
        dna: processedModules,
        imageUrl: record.fields?.["image"]?.[0]?.url || "",
        cost: record.fields?.["cost"] || 100,
        carbon: record.fields?.["embodied_carbon"] || -100,
      }
    })

    return houseTypes
  } catch (err) {
    console.warn(err)
    return []
  }
}
