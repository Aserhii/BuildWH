# README

## Getting Started

### 1. Create Airtable Base(s)

You'll need to sign up to Airtable if you haven't already (and also **generate an API key in your account settings**, for later).

Here is a sample Airtable Base that will work with Build X: https://airtable.com/shrfLb5VdqrzkrR05

You can copy this as a starter template. Press the `Copy base` button in the top right to copy one into your own workspace.

This was necessary because your API key won't work with shared bases. The base ID (which we'll need for our configuration later) must be in the format described [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Any new Airtable base can be created and plugged into Build X so long as the schema remains the same and the necessary records are entered.

### 2. Fork Build X

Either `Use this template` (no-code users) or `Fork` (developers/contributors) this repository.

### 3. Edit the Configuraton

The configuration file is `buildx.config.yaml` written in [YAML](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html#yaml-basics).

You can use the GitHub UI to edit this file by clicking on the file to open it, and then clicking the :pencil2: pencil icon in the top right to _Edit this file_.

The `id` and `name` fields can be anything so long as the `id`'s are unique. The `airtableId` is the Airtable Base ID as described [here](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Commit your changes when finished editing (the button at the bottom).

### 4. Deployment

The easiest way to deploy this project is with a serverless provider such as [Vercel](https://vercel.com) or [Netlify](https://netlify.com). You can sign up for an account with either provider using your GitHub account, and then create a deployment pointing to your GitHub repository (the same one that you just edited the configuration file with).

#### Environment Variables

There are two environment variables that must be defined in the deployment dashboard (i.e. on Vercel or Netlify or whichever provider you're using):

| Key                               | Value                 |
| --------------------------------- | --------------------- |
| `NEXT_PUBLIC_AIRTABLE_API_KEY`    | Your Airtable API key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token   |

Please go to https://account.mapbox.com/auth/signup/ to get a Mapbox account if necessary. You should be able to get an access token from https://account.mapbox.com/.

(If running locally, add these to `.env.local` in the usual environment variable file format)

### 5. Embed as an Iframe

Once you've deployed your project, you'll be given a URL which you can embed in your website with [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) element.
