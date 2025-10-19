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

interface LocationMapPickerProps {
  onLocationSelect: (location: {
    name: string;
    lat: number;
    lon: number;
  }) => void;
}

export function LocationMapPicker({
  onLocationSelect,
}: LocationMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [cityName, setCityName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    (async () => {
      const L = await import("leaflet");

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // 🧠 ป้องกัน map ซ้ำ — ลบของเก่าออกก่อนถ้ามี
            const mapEl = mapRef.current;
            if (mapEl && (mapEl as any)?._leaflet_id) {
              const existingMap = (mapEl as any)._leaflet_map_instance;
              if (existingMap) {
                existingMap.remove();
              }
              mapEl.removeAttribute("data-leaflet-id");
            }

      // ✅ สร้าง map ใหม่
      const mapInstance = L.map(mapRef.current!).setView([20, 0], 2);
      (mapRef.current as any)._leaflet_map_instance = mapInstance;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      mapInstance.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          const newMarker = L.marker([lat, lng]).addTo(mapInstance);
          setMarker(newMarker);
        }
      });

      setMap(mapInstance);

      // 🧹 Cleanup map เมื่อ component unmount
      return () => {
        mapInstance.remove();
      };
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery || !map) return;

    // Simulate geocoding (in production, use a real geocoding API like Nominatim)
    const mockResults: Record<string, { lat: number; lon: number }> = {
      tokyo: { lat: 35.6762, lon: 139.6503 },
      london: { lat: 51.5074, lon: -0.1278 },
      "new york": { lat: 40.7128, lon: -74.006 },
      paris: { lat: 48.8566, lon: 2.3522 },
      sydney: { lat: -33.8688, lon: 151.2093 },
      bangkok: { lat: 13.7563, lon: 100.5018 },
      "chiang mai": { lat: 18.7883, lon: 98.9853 },
    };

    const query = searchQuery.toLowerCase();
    const result = mockResults[query];

    if (result) {
      const { lat, lon } = result;
      setSelectedCoords({ lat, lon });
      setCityName(searchQuery);

      // Import Leaflet dynamically
      import("leaflet").then((L) => {
        map.setView([lat, lon], 10);

        if (marker) {
          marker.setLatLng([lat, lon]);
        } else {
          const newMarker = L.marker([lat, lon]).addTo(map);
          setMarker(newMarker);
        }
      });
    }
  };

  const handleConfirm = () => {
    if (selectedCoords && cityName) {
      onLocationSelect({
        name: cityName,
        lat: selectedCoords.lat,
        lon: selectedCoords.lon,
      });
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
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
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
                placeholder="Enter city name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
