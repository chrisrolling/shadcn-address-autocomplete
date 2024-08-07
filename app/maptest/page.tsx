'use client';

import { useState } from 'react';
import { Button } from "../components/ui/button";

interface Location {
    latitude: number;
    longitude: number;
}

const MapTest = () => {
    const [location, setLocation] = useState<Location | undefined>();

    const handleGetLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                console.log('Location retrieved:', { latitude, longitude });
                setLocation({ latitude, longitude });
            }, (error) => {
                console.error('Error retrieving location:', error);
            });
        } else {
            console.error('Geolocation is not available');
        }
    };

    return (
        <div>
            <h1>Your Coordinates</h1>
            <Button onClick={handleGetLocation}>Get Location</Button> {/* Button to trigger location retrieval */}
            {location ? (
                <p>Latitude: {location.latitude}, Longitude: {location.longitude}</p>
            ) : (
                <p>Click the button to get your location.</p>
            )}
        </div>
    );
};

export default MapTest;
