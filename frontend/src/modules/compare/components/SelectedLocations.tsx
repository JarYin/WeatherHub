"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { fetchLocations } from "@/modules/locations/api/locationApi";
import type { Location } from "@/modules/locations/type";
import { compareAPI } from "../api/compareApi";
import CompareWeather from "./CompareWeather";
import { weatherAPI } from "@/modules/dashboard/api/weather";

const LOCATION_PAGE_LIMIT = 10;

export default function SelectedLocations() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [compareLocations, setCompareLocations] = useState<Location[]>([]);
  const [weatherData, setWeatherData] = useState<any>([]);

  const loadMoreLocations = useCallback(async () => {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchLocations(page, LOCATION_PAGE_LIMIT);

      if (response && response.data.length > 0) {
        // นำข้อมูลใหม่มาต่อท้ายข้อมูลเดิม
        setLocations((prevLocations) => [...prevLocations, ...response.data]);
        // อัปเดตหน้าถัดไป
        setPage((prevPage) => prevPage + 1);

        if (response.data.length < LOCATION_PAGE_LIMIT) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      toast.error("Failed to fetch location data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const fetchComparedLocations = useCallback(async () => {
    try {
      const response = await compareAPI.getComparedLocations();
      if (!response) {
        toast.error("Failed to fetch compared locations.");
        return;
      }
      setCompareLocations(response.data);
      await fetchWeatherData(response.data);
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message ||
        "Failed to fetch compared locations";
      toast.error(`${errMsg}`);
    }
  }, [compareLocations]);

  const fetchWeatherData = useCallback(async (location: Location[]) => {
    try {
        console.log("Fetching weather data for compared locations:", location);
      const weatherPromises = location.map((loc) =>
        weatherAPI.getLatest(loc.location?.id ?? "")
      );
      const weatherResults = await Promise.all(weatherPromises);
      setWeatherData(weatherResults);

      console.log("Completed fetching weather data for compared locations:", weatherResults);
    } catch (error) {
      console.error("Error fetching weather data for compared locations:", error);
    }
  }, [compareLocations]);

  useEffect(() => {
    loadMoreLocations();
    fetchComparedLocations();
  }, []);

  return (
    <>
      <Card className="w-full shadow-sm hover:shadow-md transition-shadow bg-transparent border border-border">
        <CardHeader>
          <h2 className="text-lg font-semibold">Selected Locations</h2>
          <p className="text-muted-foreground">Choose locations to compare</p>
        </CardHeader>

        <CardContent>
          {compareLocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No locations selected for comparison.
            </p>
          ) : (
            <div className="flex gap-2 mb-2">
              {compareLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-2 border border-border rounded-md bg-secondary/50 text-xs flex items-center hover:bg-secondary/70 transition-colors"
                >
                  <MapPin className="mr-1 h-3 w-3" />
                  {loc?.location?.name}
                  <X className="ml-3 h-3 w-3 cursor-pointer hover:text-red-500" />
                </div>
              ))}
            </div>
          )}
          <LocationPopover
            open={open}
            setOpen={setOpen}
            value={value}
            setValue={setValue}
            locations={locations}
            loadMore={loadMoreLocations}
            hasMore={hasMore}
            isLoading={isLoading}
            setCompareLocations={setCompareLocations}
          />
        </CardContent>
      </Card>
      <div className="mt-4">
        <CompareWeather location={compareLocations} />
      </div>
    </>
  );
}

function LocationPopover({
  open,
  setOpen,
  value,
  setValue,
  locations,
  loadMore,
  hasMore,
  isLoading,
  setCompareLocations,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  locations: Location[];
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  setCompareLocations: React.Dispatch<React.SetStateAction<Location[]>>;
}) {
  const [locationId, setLocationId] = useState("");
  // Infinite Scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;

    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isAtBottom && hasMore && !isLoading) {
      loadMore();
    }
  };

  const handlerSubmit = async (name: string, id: string) => {
    if (!name || !id) {
      toast.error("Please select a location to add.");
      return;
    }

    try {
      const response = await compareAPI.compareLocation(id);
      if (!response) {
        toast.error(
          response.message || "Failed to add location. Please try again."
        );
        return;
      }
      setCompareLocations((prev) => [...prev, response.data]);
      toast.success(`Location "${name}" added for comparison.`);
      setValue("");
      setLocationId("");
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message || "Failed to add location";
      toast.error(`${errMsg}`);
    }
  };

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open}>
            {value
              ? locations.find((loc) => loc.name === value)?.name
              : "Add location"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search locations..." />
            <CommandList onScroll={handleScroll}>
              <CommandEmpty>No locations found.</CommandEmpty>

              <CommandGroup>
                {locations.map((location) => (
                  <CommandItem
                    key={location.id}
                    onSelect={() => {
                      setValue(location.name);
                      setLocationId(location.id ?? "");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === location.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location.name}
                  </CommandItem>
                ))}
                {isLoading && (
                  <CommandItem disabled className="opacity-50 justify-center">
                    Loading more...
                  </CommandItem>
                )}
                {!hasMore && locations.length > 0 && (
                  <CommandItem disabled className="opacity-50 justify-center">
                    No more locations.
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        onClick={() => handlerSubmit(value, locationId)}
        variant="default"
        className="ml-2"
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
