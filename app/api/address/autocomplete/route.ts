import { getGeolocation } from "@/app/_components/address-autocomplete/utils/get-geolocation";
import { type NextRequest, NextResponse } from "next/server";

/**
 * This API makes a request to Google Places autocomplete for a specified text string, it includes lat/long where shared to give bias to closer results.
 * @param req
 * @constructor
 * @deprecated This is not used within the Client Component anymore and has been replaced by a Server Action
 */

export async function GET(req: NextRequest) {
	const apiKey = process.env.GOOGLE_PLACES_API_KEY as string;
	if (!apiKey) {
		return NextResponse.json({ error: "Missing API Key", data: null });
	}

	// note: This should be HTTPS if hosted anywhere!
	const { searchParams } = new URL(
		req.url,
		`http://${req.headers?.get("host")}`,
	);
	const gUuid = searchParams.get("g-UUID"); // Added line to extract g-UUID

	// Obtain lat/long from the request
	const lat = searchParams.get('lat');
	const lng = searchParams.get('lng');


	// Check if your hosting provider gives you the country code.  Default to GB.
	const country = await getGeolocation() || "GB";

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
		let response: Response;

		if (lat && lng) {
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
		}
		else {
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
					// Location biased towards the user's country
					includedRegionCodes: [country || "GB"],
				}),
			});
		}
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return NextResponse.json({ data: data.suggestions, error: null });
	} catch (error) {
		console.error("Error fetching autocomplete suggestions:", error);
		return NextResponse.json({ error: error, data: null });
	}
}
