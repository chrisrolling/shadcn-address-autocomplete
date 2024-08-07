"use client";

import { FormMessages } from "../../components/form-messages";
import { Button } from "../../components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandList,
} from "../../components/ui/command";
import { Input } from "../../components/ui/input";
import { useDebounce } from "@/app/_components/address-autocomplete/hooks/use-debounce";
import { Delete, Loader2, Pencil, LocateFixed } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddressDialog from "./address-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { v4 as uuidv4 } from "uuid";
import { AddressType } from "@/app/_components/address-autocomplete/types/address-type";

// Adding a basic toast for location
import { useToast } from "../../components/ui/use-toast";
import { Toaster } from "../../components/ui/toaster";

// Import server actions
import { getPlaceData, autocompleteAddress } from "@/app/_components/address-autocomplete/actions/placeActions";

interface AddressAutoCompleteProps {
	address: AddressType;
	setAddress: (address: AddressType) => void;
	searchInput: string;
	setSearchInput: (searchInput: string) => void;
	dialogTitle: string;
	showInlineError?: boolean;
	placeholder?: string;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
	const [gUuid, setGUuid] = useState<string>(uuidv4());
	const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

	const {
		address,
		setAddress,
		dialogTitle,
		showInlineError = true,
		searchInput,
		setSearchInput,
		placeholder,
	} = props;

	const [selectedPlaceId, setSelectedPlaceId] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const [data, setData] = useState<{ address: AddressType; adrAddress: string } | null>(null);
	const [isLoading, setIsLoading] = useState(false);


	useEffect(() => {
		if (selectedPlaceId !== "") {
			setIsLoading(true);
			getPlaceData(selectedPlaceId, gUuid)
				.then((response) => {
					if (response) {
						setData(response);
					}
				})
				.finally(() => setIsLoading(false));
		}
	}, [selectedPlaceId, gUuid]);

	const adrAddress = data?.adrAddress ?? "";  // Ensure adrAddress is always a string

	useEffect(() => {
		if (data && data.address) {
			setAddress(data.address);
		}
	}, [data, setAddress]);

	const { toast } = useToast(); // Get the toast function from the useToast hook

	const handleGetLocation = () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				({ coords }) => {
					const { latitude, longitude } = coords;
					console.log("Location retrieved:", { latitude, longitude });
					// Assume setLatLng is a state setter for the user's location
					setLatLng({ lat: latitude, lng: longitude });

					// Trigger the toast notification
					toast({
						title: "Location Access Granted",
						description: "Narrowing results based on your location...",
					});
				},
				(error) => {
					console.error("Error retrieving location:", error);
					toast({
						title: "Location Access Failed",
						description: "Could not retrieve your location.",
						variant: "destructive",
					});
				}
			);
		} else {
			console.error("Geolocation is not available");
			toast({
				title: "Geolocation Not Supported",
				description: "Your browser does not support geolocation.",
				variant: "destructive",
			});
		}
	};

	return (
		<>
			{selectedPlaceId !== "" || address.formattedAddress ? (
				<div className="flex items-center gap-2">
					<Input value={address?.formattedAddress} readOnly />

					<AddressDialog
						isLoading={isLoading}
						dialogTitle={dialogTitle}
						adrAddress={adrAddress}  // Ensure this is a string
						address={address}
						setAddress={setAddress}
						open={isOpen}
						setOpen={setIsOpen}
					>
						<Button
							disabled={isLoading}
							size="icon"
							variant="outline"
							className="shrink-0"
						>
							<Pencil className="size-4" />
						</Button>
					</AddressDialog>
					<Button
						type="reset"
						onClick={() => {
							setSelectedPlaceId("");
							setAddress({
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
						}}
						size="icon"
						variant="outline"
						className="shrink-0"
					>
						<Delete className="size-4" />
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<AddressAutoCompleteInput
						searchInput={searchInput}
						setSearchInput={setSearchInput}
						selectedPlaceId={selectedPlaceId}
						setSelectedPlaceId={setSelectedPlaceId}
						setIsOpenDialog={setIsOpen}
						showInlineError={showInlineError}
						placeholder={placeholder}
						latLng={latLng} // Pass the latLng state down
					/>
					<Button
						onClick={handleGetLocation}
						size="icon"
						variant="outline"
						className="shrink-0"
						title="Use location to narrow results"
					>
						<LocateFixed className="size-4" />
					</Button>
					<Toaster /> {/* Render the Toaster component to display the toasts */}
				</div>
			)}
		</>
	);
}

interface CommonProps {
	selectedPlaceId: string;
	setSelectedPlaceId: (placeId: string) => void;
	setIsOpenDialog: (isOpen: boolean) => void;
	showInlineError?: boolean;
	searchInput: string;
	setSearchInput: (searchInput: string) => void;
	placeholder?: string;
	latLng: { lat: number; lng: number } | null; // Add latLng prop here
}

function AddressAutoCompleteInput(props: CommonProps) {
	const {
		setSelectedPlaceId,
		selectedPlaceId,
		setIsOpenDialog,
		showInlineError,
		searchInput,
		setSearchInput,
		placeholder,
		latLng, // Receive the latLng prop
	} = props;
	const [gUuid, setGUuid] = useState<string>("");

	useEffect(() => {
		setGUuid(uuidv4());
	}, []);

	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Escape") {
			close();
		}
	};

	const debouncedSearchInput = useDebounce(searchInput, 500);
	const shouldFetch = debouncedSearchInput && debouncedSearchInput.trim() !== "";

	const [predictions, setPredictions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (shouldFetch) {
			setIsLoading(true);
			autocompleteAddress(debouncedSearchInput, gUuid, latLng)
				.then((data) => {
					setPredictions(data);
				})
				.finally(() => setIsLoading(false));
		}
	}, [debouncedSearchInput, gUuid, latLng]);

	return (
		<Command
			shouldFilter={false}
			onKeyDown={handleKeyDown}
			className="overflow-visible"
		>
			<div className="flex w-full items-center justify-between rounded-lg border bg-background ring-offset-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<CommandPrimitive.Input
					value={searchInput}
					onValueChange={setSearchInput}
					onBlur={close}
					onFocus={open}
					placeholder={placeholder || "Enter address"}
					className="w-full p-3 rounded-lg outline-none"
				/>
			</div>
			{searchInput !== "" && !isOpen && !selectedPlaceId && showInlineError && (
				<FormMessages
					type="error"
					className="pt-1 text-sm"
					messages={["Select a valid address from the list"]}
				/>
			)}

			{isOpen && (
				<div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
					<CommandList>
						<div className="absolute top-1.5 z-50 w-full">
							<CommandGroup
								className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
								{isLoading ? (
									<div className="h-28 flex items-center justify-center">
										<Loader2 className="size-6 animate-spin"/>
									</div>
								) : (
									<>
										{predictions.map(
											(prediction: {
												placePrediction: {
													placeId: string;
													place: string;
													text: { text: string };
												};
											}) => (
												<CommandPrimitive.Item
													value={prediction.placePrediction.text.text}
													onSelect={() => {
														setSearchInput("");
														setSelectedPlaceId(
															prediction.placePrediction.place
														);
														setIsOpenDialog(true);
													}}
													className="flex select-text flex-col cursor-pointer gap-0.5 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-start"
													key={prediction.placePrediction.placeId}
													onMouseDown={(e) => e.preventDefault()}
												>
													{prediction.placePrediction.text.text}
												</CommandPrimitive.Item>
											)
										)}
									</>
								)}

								<CommandEmpty>
									{!isLoading && predictions.length === 0 && (
										<div className="py-4 flex items-center justify-center">
											{searchInput === ""
												? "Please enter an address"
												: "No address found"}
										</div>
									)}
								</CommandEmpty>
							</CommandGroup>
							<div className="pt-2 flex justify-end">
								<img
									src="/images/google-logo-light.png"
									alt="Powered by Google"
									className="w-24 h-auto dark:hidden"
								/>
								<img
									src="/images/google-logo-dark.png"
									alt="Powered by Google"
									className="w-24 h-auto hidden dark:block"
								/>
							</div>
						</div>
					</CommandList>
				</div>
			)}
		</Command>
	);
}
