"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchLocations } from "@/modules/locations/api/locationApi";
import { Location } from "@/modules/locations/type";
import { MapPin, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface SearchLocationProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  pagination: {
    page: number;
    totalPages: number;
    limit: number;
  };
}

export default function SearchLocation({
  locations,
  onLocationSelect,
  pagination,
}: SearchLocationProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [locationsByPage, setLocationsByPage] = useState<
    Record<number, Location[]>
  >({ 1: locations });
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const rearrangedRef = useRef(false); // ป้องกันจัดเรียงซ้ำ

  useEffect(() => {
    setLocationsByPage((prev) => ({ ...prev, 1: locations }));
  }, [locations]);

  // Effect สำหรับดึงข้อมูลหน้าที่เหลือ
  useEffect(() => {
    if (
      pagination.totalPages <= 1 ||
      isLoadingAll ||
      rearrangedRef.current
    ) {
      return;
    }

    async function fetchAllOtherPages() {
      setIsLoadingAll(true);
      try {
        const promises = [];
        // สร้าง Promise สำหรับดึงข้อมูลทุกหน้าที่เหลือ (เริ่มจาก 2)
        for (let page = 2; page <= pagination.totalPages; page++) {
          promises.push(fetchLocations(page, pagination.limit));
        }

        const responses = await Promise.all(promises);

        const newPagesData: Record<number, Location[]> = {};
        responses.forEach((response, index) => {
          const pageNum = index + 2; // +2 เพราะเราเริ่ม loop ที่ page 2
          if (response?.data?.length) {
            newPagesData[pageNum] = response.data;
          }
        });

        setLocationsByPage((prev) => ({
          ...prev,
          ...newPagesData,
        }));
      } catch (error) {
        console.error("Error fetching all locations:", error);
      } finally {
        setIsLoadingAll(false);
      }
    }

    fetchAllOtherPages();
  }, [pagination.totalPages, pagination.limit]);

  // Effect สำหรับจัดเรียงตำแหน่ง (Rearrangement Logic)
  useEffect(() => {
    if (rearrangedRef.current || isLoadingAll) return;

    const allPagesFetched =
      Object.keys(locationsByPage).length === pagination.totalPages;

    if (!allPagesFetched || pagination.totalPages === 0) return;

    const all = Object.values(locationsByPage).flat();
    if (all.length === 0) return;

    const defaultLocation = all.find((loc) => loc.isDefault);

    if (!defaultLocation) {
      const firstLocation = all[0];
      if (firstLocation && !selectedLocation) {
        setSelectedLocation(firstLocation);
        onLocationSelect?.(firstLocation);
      }
      rearrangedRef.current = true; // ตรวจสอบแล้ว
      return;
    }

    // --- เริ่ม Logic การจัดเรียง ---
    setLocationsByPage((prev) => {
      const allData = Object.values(prev).flat();
      const withoutDefault = allData.filter((l) => l.id !== defaultLocation.id);

      const newPage1 = [
        defaultLocation,
        ...withoutDefault.slice(0, pagination.limit - 1),
      ];
      const remaining = withoutDefault.slice(pagination.limit - 1);

      const newPagesObj: Record<number, Location[]> = { 1: newPage1 };
      let pageNum = 2;
      for (let i = 0; i < remaining.length; i += pagination.limit) {
        newPagesObj[pageNum] = remaining.slice(i, i + pagination.limit);
        pageNum++;
      }

      return newPagesObj;
    });

    rearrangedRef.current = true;
    setSelectedLocation(defaultLocation);
    onLocationSelect?.(defaultLocation);
  }, [
    locationsByPage,
    pagination.limit,
    pagination.totalPages,
    onLocationSelect,
    isLoadingAll,
    selectedLocation,
  ]);

  const currentPageLocations = locationsByPage[pagination.page] || [];
  const filteredLocations = currentPageLocations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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