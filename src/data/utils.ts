import { curry } from "ramda"

const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY

const sharedAirtableHeaders = {
  Authorization: `Bearer ${apiKey}`,
}

export const createAirtableEntry = (config: {
  tableId: string
  data: any
  tab: string
}) =>
  fetch(
    `https://api.airtable.com/v0/${config.tableId}/${encodeURIComponent(
      config.tab
    )}`,
    {
      method: "POST",
      headers: {
        ...sharedAirtableHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: config.data,
          },
        ],
      }),
    }
  ).then((res) => res.json())

export const getAirtableEntries = (config: { tableId: string; tab: string }) =>
  fetch(
    `https://api.airtable.com/v0/${config.tableId}/${encodeURIComponent(
      config.tab
    )}`,
    {
      headers: {
        ...sharedAirtableHeaders,
      },
    }
  ).then((res) => res.json())

export const getField = curry(
  (record: Record<string, any>, keys: string | Array<string>): any => {
    if (typeof keys === "string") {
      return record[keys]
    }
    if (keys.length === 0) {
      return undefined
    }
    const [firstKey, ...restKeys] = keys
    return record[firstKey] || getField(record, restKeys)
  }
)
