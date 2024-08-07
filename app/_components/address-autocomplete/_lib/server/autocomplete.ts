// server-actions.ts
import { type NextRequest } from "next/server"; // Import the NextRequest type if needed for typing the request

export async function fetchAutocompleteSuggestions(req: NextRequest) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
    if (!apiKey) {
        return { error: "Missing API Key", data: null };
    }

    const { searchParams } = new URL(req.url, `http://${req.headers.get("host")}`);
    const gUuid = searchParams.get("g-UUID");

    // Check if your hosting provider gives you the country code
    // const country = await getGeolocation();
    const country = "GB";
    const input = searchParams.get("input");

    const url = "https://places.googleapis.com/v1/places:autocomplete";

    const primaryTypes = [
        "street_address",
        "subpremise",
        "route",
        "street_number",
        "landmark",
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
            },
            body: JSON.stringify({
                input: input,
                sessionToken: gUuid,
                includedPrimaryTypes: primaryTypes,
                // Location biased towards the user's country
                includedRegionCodes: [country || "GB"],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return { data: data.suggestions, error: null };
    } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        return null; // { error: error.message, data: null };
    }
}
