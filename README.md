# README

## Introduction

Write me

## Getting Started

### 1. Fork This Repo

https://github.com/theopensystemslab/buildx-next/fork

### 2. Fork an Airtable

Go to https://airtable.com/shrfLb5VdqrzkrR05 and import this Airtable into your own workspace with the `Copy base` button in the top-right corner.

You'll need to sign up to Airtable, and also **generate an API key in your account settings**.

### 3. Provide Environment Variables

`NEXT_PUBLIC_AIRTABLE_API_KEY` and `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` must be defined. Use a file called `.env.local` when running locally, it should look like:

```
NEXT_PUBLIC_AIRTABLE_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

Please go to https://airtable.com/account to get your Airtable API key, as above

Please go to https://account.mapbox.com/auth/signup/ to get a Mapbox account if necessary. You should be able to get an access token from https://account.mapbox.com/.

Environment variables can also be provided through hosting service dashboard e.g. on Vercel or Netlify

### 4. Provide a Configuration

Build X is configured via the file `buildx.config.json`.

You can modify the existing file from the forked repository. You'll need to have access to each of these Airtable entries, this will only be possible for your API key if these Airtable bases are part of the workspace for which your API key is associated, so the entries from the forked repository won't work but demonstrate the file format.

You may configure a single build system like so:

```json
{
  "systems": [
    {
      "id": "swift-clone",
      "name": "My Swift Clone",
      "airtableId": "applDFo6T2z1MjOt9"
    }
  ]
}
```

The `airtableId` is the Airtable Base ID, documented [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs)

You can include many, like so:

```json
{
  "systems": [
    {
      "id": "swift-clone",
      "name": "My Swift Clone",
      "airtableId": "applDFo6T2z1MjOt9"
    },
    {
      "id": "holz100",
      "name": "HOLZ100",
      "airtableId": "appzG3plVRqgH6c5f"
    }
  ]
}
```

Including only a single build system will cause appropriate behaviour e.g. giving no choice of build systems but proceeding directly to the house types selection in the sidebar to add a house type. This makes for a nice embed experience on a build system's website.

### 5. (Optional) Run Locally

Try running the application locally either with `yarn`:

```
yarn
yarn dev
```

Or with `npm`:

```
npm install
npm run dev
```

### 6. Deployment

Commit and push your changes first!

```
git add .
git commit -m "configuration"
git push
```

We then recommend using a service like Vercel or Netlify to deploy this project serverlessly. Commit the changes to the configuration file, push, and then go through the simple step by step deployment process with either of these providers to deploy this repository to a live site.
