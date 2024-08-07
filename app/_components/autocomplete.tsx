"use client";

import AddressAutoComplete, {
} from "./address-autocomplete";
import {AddressType} from "@/app/_components/address-autocomplete/types/address-type";
import { useState } from "react";

export const AutocompleteComponent = () => {
	const [address, setAddress] = useState<AddressType>({
		address1: "",
		address2: "",
		formattedAddress: "",
		city: "",
		region: "",
		postalCode: "",
		country: "",
		lat: 0,
		lng: 0,
	});
	const [searchInput, setSearchInput] = useState("");
	return (
		<AddressAutoComplete
			address={address}
			setAddress={setAddress}
			searchInput={searchInput}
			setSearchInput={setSearchInput}
			dialogTitle="Enter Address"
		/>
	);
};
