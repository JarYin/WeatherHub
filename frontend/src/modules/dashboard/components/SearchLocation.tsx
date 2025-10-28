"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Location } from "@/modules/locations/type";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchLocationProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
}

export default function SearchLocation({
  locations,
  onLocationSelect,
}: SearchLocationProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (locations.length === 0) return;
    const defaultLocation =
      locations.find((location) => location.isDefault) || locations[0];
    setSelectedLocation(defaultLocation);
    onLocationSelect?.(defaultLocation);
  }, [locations]);

  function handleLocationSelect(location: Location) {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border-border/50">
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 bg-background w-full"
        />
      </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {(() => {
        const ordered = [...filteredLocations];
        const defaultIndex = ordered.findIndex((l) => l.isDefault);
        if (defaultIndex > 0) {
        const [def] = ordered.splice(defaultIndex, 1);
        ordered.unshift(def);
        }

        return ordered.map((location: Location) => (
        <Button
          key={location.id}
          variant={
          selectedLocation?.id === location.id ? "default" : "outline"
          }
          size="sm"
          onClick={() => handleLocationSelect(location)}
          className="gap-2 w-full"
        >
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{location.name}</span>
        </Button>
        ));
      })()}
      </div>
    </div>
  );
}
