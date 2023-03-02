# README

## Introduction

Write me

## Getting Started

### 1. Copy an Airtable

The following build systems provide an open Airtable Base containing all the data for their build system:

> TODO: Table here of build systems with base share links
> e.g. https://airtable.com/shrfLb5VdqrzkrR05 for Swift

### 2. Provide the Environment Variables

The follwoing environment variables must be defined, use a file called `.env.local` when running locally, in the following format, with the values in places of the `...`:

```
NEXT_PUBLIC_AIRTABLE_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
NEXT_PUBLIC_AIRTABLE_BASE_IDS=...
```

Or provide these through the deployment dashboard e.g. on Vercel or Netlify

The `NEXT_PUBLIC_AIRTABLE_BASE_IDS` variable can be a single Airtable Base ID, in which case the application adapt to only serving one build system. It can also be many, separated by `,`, e.g.:

```
NEXT_PUBLIC_AIRTABLE_BASE_IDS=appGlzQcCZpDNRFsE,appzG3plVRqgH6c5f,app25JFkKVKKEt5io
```

In this case, the application will adapt and provide a choice of build systems to choose from in the house type selection sidebar.

The `airtableId` is the Airtable Base ID, documented [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs)

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftheopensystemslab%2Fbuildx-next%2Ftree%2Fmake-configurable)
