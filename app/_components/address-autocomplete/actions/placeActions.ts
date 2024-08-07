// app/actions/placeActions.ts

"use server";

import { getGeolocation } from "@/app/_components/address-autocomplete/utils/get-geolocation";
import {AddressType} from "@/app/_components/address-autocomplete/types/address-type";

export async function autocompleteAddress(input: string, gUuid: string, latLng: { lat: number; lng: number } | null) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    // Check if your hosting provider gives you the country code.  Default to GB.
    const country = await getGeolocation() || "GB";

    const url = "https://places.googleapis.com/v1/places:autocomplete";

    const primaryTypes = [
        "street_address",
        "subpremise",
        "route",
        "street_number",
        "landmark",
    ];

    try {
        let response: Response;

        if (latLng) {
            const { lat, lng } = latLng;
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                },
                body: JSON.stringify({
                    input: input,
                    locationBias: {
                        circle: {
                            center: {
                                latitude: lat,
                                longitude: lng,
                            },
                            radius: 5000.0,
                        },
                    },
                    sessionToken: gUuid,
                    includedPrimaryTypes: primaryTypes,
                }),
            });
        } else {
            response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                },
                body: JSON.stringify({
                    input: input,
                    sessionToken: gUuid,
                    includedPrimaryTypes: primaryTypes,
                    includedRegionCodes: [country || "GB"],
                }),
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Return only the relevant data needed for your component
        return data.suggestions;
    } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        throw error;  // Handle the error in your component
    }
}
export async function getPlaceData(placeId: string, gUuid: string): Promise<{ address: AddressType, adrAddress: string } | null> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;

    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    const url = `https://places.googleapis.com/v1/${placeId}?sessionToken=${gUuid}`;

    try {
        const response = await fetch(url, {
            headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "adrFormatAddress,shortFormattedAddress,formattedAddress,location,addressComponents",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Function to extract address components using regex
        const dataFinderRegx = (c: string) => {
            const regx = new RegExp(`<span class="${c}">([^<]+)<\/span>`);
            const match = data.adrFormatAddress.match(regx);
            return match ? match[1] : "";
        };

        const address1 = dataFinderRegx("street-address");
        const address2 = "";
        const city = dataFinderRegx("locality");
        const region = dataFinderRegx("region");
        const postalCode = dataFinderRegx("postal-code");
        const country = dataFinderRegx("country-name");
        const lat = data.location.latitude;
        const lng = data.location.longitude;

        const formattedAddress = data.formattedAddress;

        const formattedData: AddressType = {
            address1,
            address2,
            formattedAddress,
            city,
            region,
            postalCode,
            country,
            lat,
            lng,
        };

        return {
            address: formattedData,
            adrAddress: data.adrFormatAddress,
        };
    } catch (err) {
        console.error("Error fetching place details:", err);
        throw err;
    }
}