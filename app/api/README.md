# [DEPRECATED] API Routes

> [!CAUTION]
> These API Routes are Deprecated and should be removed from your code/use.
> 
> There is no requirement to deploy them. 

These API Routes have been modified to include:
1. Session Tokens - generated at the UI Component and provided within autocomplete sessions and then terminated with a place call. The sessionTokens allow grouping at the Google maps end which then (currently) only charges for the places call.
2. Include Lat and Long for narrowing where it is provided/enabled in the UI

## Deprecation
The API routes have been removed from use in the code set and replaced with Server actions.
API routes have been removed because they can be directly called by external parties in NextJS which would allow indirect exposure of cost through unsolicited use.

If you wish to return their use, please rename the api-index.txt to 'index.tsx' in the address-autocomplete folder and remove teh server action.

No further updates are made as part of this repo to the API routes.

> [!IMPORTANT]
> YOU DO NOT NEED TO DEPLOY THE API unless you are using them.