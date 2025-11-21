"use client";

import { useState, useTransition, useEffect } from "react";
import { markAttendance } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/ui-alert";

interface FormState {
    message: string;
}

const initialState: FormState = {
    message: "",
};

export default function MarkAttendanceForm({ employees }: { employees: any[] }) {
    const [state, setState] = useState<FormState>(initialState);
    const [isPending, startTransition] = useTransition();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [useManualLocation, setUseManualLocation] = useState(false);
    const [manualLat, setManualLat] = useState("");
    const [manualLng, setManualLng] = useState("");

    const requestLocation = () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setIsLoadingLocation(false);
                    setUseManualLocation(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    let errorMessage = "Failed to get location. ";

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += "Please allow location access in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage += "Location request timed out.";
                            break;
                        default:
                            errorMessage += "An unknown error occurred.";
                    }

                    setLocationError(errorMessage);
                    setIsLoadingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            setIsLoadingLocation(false);
        }
    };

    useEffect(() => {
        requestLocation();
    }, []);

    const handleManualLocationToggle = () => {
        setUseManualLocation(!useManualLocation);
        if (!useManualLocation) {
            // Pre-fill with current location if available
            if (location) {
                setManualLat(location.lat.toString());
                setManualLng(location.lng.toString());
            }
        }
    };

    const handleSubmit = (formData: FormData) => {
        let finalLat: number;
        let finalLng: number;

        if (useManualLocation) {
            finalLat = parseFloat(manualLat);
            finalLng = parseFloat(manualLng);

            if (isNaN(finalLat) || isNaN(finalLng)) {
                setState({ message: "Please enter valid coordinates." });
                return;
            }

            if (finalLat < -90 || finalLat > 90 || finalLng < -180 || finalLng > 180) {
                setState({ message: "Coordinates out of valid range." });
                return;
            }
        } else {
            if (!location) {
                setState({ message: "Location is required to mark attendance." });
                return;
            }
            finalLat = location.lat;
            finalLng = location.lng;
        }

        formData.append("latitude", finalLat.toString());
        formData.append("longitude", finalLng.toString());

        startTransition(async () => {
            const result = await markAttendance(state, formData);
            setState(result as FormState);

            // Reset form on success
            if (result.message.includes("Success")) {
                setTimeout(() => {
                    setState(initialState);
                }, 2000);
            }
        });
    };


    return (
        <>
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/dashboard/attendance">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Check In / Out</CardTitle>
                    <CardDescription>
                        Your location will be recorded for attendance tracking.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Location Status */}
                    <div className="mb-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        {isLoadingLocation ? (
                            <div className="flex items-center text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching location...
                            </div>
                        ) : locationError ? (
                            <div className="w-full space-y-3">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {locationError}
                                    </AlertDescription>
                                </Alert>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={requestLocation}
                                    >
                                        <RefreshCw className="mr-2 h-3 w-3" />
                                        Retry
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleManualLocationToggle}
                                    >
                                        Enter Manually
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-2">
                                <div className="text-green-600 text-sm flex items-center justify-center font-medium">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Location Acquired
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({location?.lat.toFixed(4)}, {location?.lng.toFixed(4)})
                                    </span>
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleManualLocationToggle}
                                        className="text-xs"
                                    >
                                        {useManualLocation ? "Use Auto Location" : "Enter Manually"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Location Entry */}
                    {useManualLocation && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                            <Label className="text-sm font-medium text-blue-900">Manual Location Entry</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="manualLat" className="text-xs">Latitude</Label>
                                    <Input
                                        id="manualLat"
                                        type="number"
                                        step="any"
                                        placeholder="e.g., 28.6139"
                                        value={manualLat}
                                        onChange={(e) => setManualLat(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="manualLng" className="text-xs">Longitude</Label>
                                    <Input
                                        id="manualLng"
                                        type="number"
                                        step="any"
                                        placeholder="e.g., 77.2090"
                                        value={manualLng}
                                        onChange={(e) => setManualLng(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-blue-700">
                                💡 Tip: You can get coordinates from Google Maps by right-clicking on a location.
                            </p>
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Select Employee</Label>
                            <Select name="employeeId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            {employee.name} ({employee.designation})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {state?.message && (
                            <div className={`p-3 rounded-md text-sm text-center ${state.message.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                {state.message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            disabled={isPending || (isLoadingLocation && !useManualLocation)}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Mark Attendance"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

