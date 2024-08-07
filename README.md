# Shadcn Address Autocomplete (with nearby)

## Revised Component
This is destructive FORK (i.e. it fundamentally alters the construction but not functionality) of Shadcn Address Autocomplete to include the following:
1. Replacement of API Routes with Server Actions 
2. Addition of Nearby Functionality/Addition of geolocation option to group nearest search results first
3. Addition of session tokens in google places/autocomplete calls in order to reduce cost and bill appropriately
4. Addition of Google Logo/powered by to meet licensing conditions
5. Addition of a shadcn toast to advise that location is going to be used to narrow results (where authorised).
6. Removal of duplicate/null calls to API routes
7. Note: Linting removed due to not intending this to be a maintained fork.
8. Re-organisation of code base to provide a component that can be re-used
9. Mocks removed because not relevant to my need.

The core functionality remains the same as build by NiazMorshed2007 who authored the component.

You just get a new box that lets a user share their location, google then groups the locations closest to that point in a circle. (bias, not restriction)

## Original Component

An address autocomplete component built with [Google Places API (new)](https://developers.google.com/maps/documentation/places/web-service/op-overview) and [shadcn/ui](https://ui.shadcn.com/) components.

https://github.com/NiazMorshed2007/shadcn-address-autocomplete/assets/77217706/cfd645c5-b8a9-46cf-bbb1-dc83d86fe142

> **Note 📝**
> The live url uses mock data, you should take care of setting api keys properly for real uses.
>

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Validation:** [Zod](https://zod.dev)

## Running Locally

1. Clone the repository

   ```bash
   git clone https://github.com/NiazMorshed2007/shadcn-address-autocomplete
   ```

2. Install dependencies using pnpm

   ```bash
   pnpm install
   ```

3. Copy the `.env.example` to `.env` and update the variables.

   ```bash
   cp .env.example .env
   ```

**For this fork, you need to create a .env with the google_places_api_key

4. Start the development server

   ```bash
   pnpm run dev
   ```

## [DEPRECATED] API Routes
The API Routes are included and updated to provide the same functionality as the server actions, but are deprecated and not used.

## Use as a Component
1. The _components directory contains all the custom components and actions, including their types.
2. This can be imported into a project and then adjusted to needs.
3. You need to change the imports to your implementation of the shadcn UI components (the components/ui directory)- or import these standard components into your UI location.
4. You do not need the page.tsx in the root or the theme provider. These can be removed if you use alternative.
5. To get the google logo to display, you need to put the google logo somewhere accessible - there are copies in public/images that you could use.
6. You need to create a .env file specifying your GOOGLE_PLACES_API_KEY= 
7. The Google_Places_API_Key only requires the Google Places (New) API - you can disable all others. 
8. Make sure you set restrictions on your Google API key, it uses a Server Action so you should be able to restrict it to just your domain (when hosted)
9.  Add an import to the component
10.  Add the component tag <AutocompleteComponent />

