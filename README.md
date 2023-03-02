# README

## Introduction

Write me

## Getting Started

### Environment

`NEXT_PUBLIC_AIRTABLE_API_KEY` and `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` must be defined. Use a file called `.env.local` when running locally, it should look like:

```
NEXT_PUBLIC_AIRTABLE_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

(with `...` filled out as your API key of course)

### Configuring Build Systems

In the `buildx.config.ts` file, complete the `systems` key like so:

```ts
export const systems: Array<System> = [
  {
    id: "swift",
    name: "WikiHouse Swift",
    airtableId: "appGlzQcCZpDNRFsE",
  },
]
```

The `airtableId` is the Airtable Base ID, documented [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs)

You can include many, like so:

```ts
export const systems: Array<System> = [
  {
    id: "swift",
    name: "WikiHouse Swift",
    airtableId: "appGlzQcCZpDNRFsE",
  },
  {
    id: "holz100",
    name: "HOLZ100",
    airtableId: "appzG3plVRqgH6c5f",
  },
]
```

Including only a single build system will cause appropriate behaviour e.g. giving no choice of build systems but proceeding directly to the house types selection in the sidebar to add a house type.

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftheopensystemslab%2Fbuildx-next%2Ftree%2Fmake-configurable)
