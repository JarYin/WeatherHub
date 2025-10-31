"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import L from "leaflet";
import { createLocation } from "../api/locationApi";

interface LocationMapPickerProps {
  onLocationSelect: (submit: boolean) => void;
}

export function LocationMapPicker({
  onLocationSelect,
}: LocationMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [cityName, setCityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timezone, setTimezone] = useState<string>("");

  const fetchTimezone = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();
      const timezoneObject = data.localityInfo.informative?.find(
        (item: any) => item.description === "time zone"
      );
      if (timezoneObject && timezoneObject.name) {
        setTimezone(timezoneObject.name);
      } else {
        setTimezone("N/A");
      }
    } catch (error) {
      console.error("Error fetching timezone:", error);
      setTimezone("Error");
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setCityName(data.display_name);
      } else {
        setCityName("Unknown location");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setCityName("Could not fetch address");
    }
  };

  const updateLocation = (lat: number, lon: number, name?: string) => {
    setSelectedCoords({ lat, lon });
    fetchTimezone(lat, lon);

    import("leaflet").then((L) => {
      if (map) {
        if (marker) {
          marker.setLatLng([lat, lon]);
        } else {
          const newMarker = L.marker([lat, lon]).addTo(map);
          setMarker(newMarker);
        }
        map.setView([lat, lon], 13);
      }
    });

    if (name) {
      setCityName(name);
    } else {
      reverseGeocode(lat, lon);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    (async () => {
      const L = await import("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current && !(mapRef.current as any)._leaflet_id) {
        const mapInstance = L.map(mapRef.current!).setView(
          [13.7563, 100.5018],
          5
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        mapInstance.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          updateLocation(lat, lng);
        });

        setMap(mapInstance);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery || !map) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        updateLocation(lat, lon, result.display_name);
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Error during geocoding:", error);
      alert("An error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedCoords && cityName && timezone) {
      await createLocation({
        name: cityName,
        lat: selectedCoords.lat,
        lon: selectedCoords.lon,
        timezone: timezone,
      });
      onLocationSelect(true);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Select Location on Map</CardTitle>
        <CardDescription>
          Click on the map or search for a city to select a location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a city (e.g., Tokyo, London, Bangkok)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border">
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {selectedCoords && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter location name"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <span className="ml-2 font-mono">
                  {selectedCoords.lat.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <span className="ml-2 font-mono">
                  {selectedCoords.lon.toFixed(4)}
                </span>
              </div>
              {timezone && (
                <div>
                  <span className="text-muted-foreground">Timezone:</span>
                  <span className="ml-2 font-mono">{timezone}</span>
                </div>
              )}
            </div>
            <Button onClick={handleConfirm} className="w-full gap-2">
              <MapPin className="h-4 w-4" />
              Add This Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
