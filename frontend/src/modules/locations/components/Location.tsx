"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Plus, Trash2, Edit2, Save, X, Map } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LocationMapPicker } from "./LocationMapPicker";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Badge } from "@/components/ui/badge";
import {
  createLocation,
  deleteLocation,
  fetchLocations,
  setDefaultLocation,
  updateLocation,
} from "../api/locationApi";
import { toast } from "sonner";
import { Location } from "../type";

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    lat: "",
    lon: "",
    timezone: "Asia/Bangkok",
  });

  useEffect(() => {
    async function fetchDataLocations() {
      try {
        const response = await fetchLocations();
        const normalized: Location[] = (response as any[]).map((r) => ({
          id: r.id,
          name: r.name ?? "",
          lat: Number(r.lat ?? 0),
          lon: Number(r.lon ?? 0),
          timezone: r.timezone ?? "UTC",
          isDefault: !!r.isDefault,
        }));
        setLocations(normalized);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    }

    fetchDataLocations();
  }, []);

  const handleNewLocationChange = async (submit: boolean) => {
    if (submit) {
      const response = await fetchLocations();
      const normalized: Location[] = (response as any[]).map((r) => ({
        id: r.id,
        name: r.name ?? "",
        lat: Number(r.lat ?? 0),
        lon: Number(r.lon ?? 0),
        timezone: r.timezone ?? "UTC",
        isDefault: !!r.isDefault,
      }));
      setLocations(normalized);
      setIsAddDialogOpen(false);
    } else {
      setIsAddDialogOpen(false);
      toast.error("Something went wrong while adding the location.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      const response = await fetchLocations();
      const normalized: Location[] = (response as any[]).map((r) => ({
        id: r.id,
        name: r.name ?? "",
        lat: Number(r.lat ?? 0),
        lon: Number(r.lon ?? 0),
        timezone: r.timezone ?? "UTC",
        isDefault: !!r.isDefault,
      }));
      setLocations(normalized);
    } catch (error) {
      if (error) {
        toast.error("Failed to delete location.");
      }

      return;
    }
  };

  const handleSetDefault = async (id: string) => {
    const response = await setDefaultLocation(id);
    if (response.success) {
      setLocations(
        locations.map((loc) => ({
          ...loc,
          isDefault: loc.id === id,
        }))
      );
      toast.success("Default location updated.");
    } else {
      toast.error("Failed to set default location.");
      return;
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (id: string, updatedData: Partial<Location>) => {
    try {
      await updateLocation(id, updatedData);
      const response = await fetchLocations();
      const normalized: Location[] = (response as any[]).map((r) => ({
        id: r.id,
        name: r.name ?? "",
        lat: Number(r.lat ?? 0),
        lon: Number(r.lon ?? 0),
        timezone: r.timezone ?? "UTC",
        isDefault: !!r.isDefault,
      }));
      setLocations(normalized);
      toast.success("Location updated.");
      setEditingId(null);
    } catch (error) {
      if (error) {
        toast.error("Failed to update location.");
      }
      return;
    }
  };

  const handleAdd = async () => {
    if (newLocation.name && newLocation.lat && newLocation.lon) {
      await createLocation({
        name: newLocation.name,
        lat: parseFloat(newLocation.lat),
        lon: parseFloat(newLocation.lon),
        timezone: newLocation.timezone,
      });
      const response = await fetchLocations();
      const normalized: Location[] = (response as any[]).map((r) => ({
        id: r.id,
        name: r.name ?? "",
        lat: Number(r.lat ?? 0),
        lon: Number(r.lon ?? 0),
        timezone: r.timezone ?? "UTC",
        isDefault: !!r.isDefault,
      }));
      const newLoc = normalized.find(
        (loc) =>
          loc.name === newLocation.name &&
          loc.lat === parseFloat(newLocation.lat) &&
          loc.lon === parseFloat(newLocation.lon)
      );
      if (!newLoc) {
        toast.error("Failed to add location.");
        return;
      }
      setLocations([...locations, newLoc]);
      setNewLocation({ name: "", lat: "", lon: "", timezone: "Asia/Bangkok" });
      setIsAddDialogOpen(false);
    }
  };

  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [locations]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {locations.length} locations saved
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Choose a method to add a new weather tracking location
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map" className="gap-2">
                  <Map className="h-4 w-4" />
                  Map Selection
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>
              <TabsContent value="map" className="mt-4">
                <LocationMapPicker onLocationSelect={handleNewLocationChange} />
              </TabsContent>
              <TabsContent value="manual" className="mt-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Enter Location Details</CardTitle>
                    <CardDescription>
                      Manually enter the coordinates and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">City Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Tokyo"
                          value={newLocation.name}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lat">Latitude</Label>
                          <Input
                            id="lat"
                            type="number"
                            step="0.0001"
                            placeholder="35.6762"
                            value={newLocation.lat}
                            onChange={(e) =>
                              setNewLocation({
                                ...newLocation,
                                lat: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lon">Longitude</Label>
                          <Input
                            id="lon"
                            type="number"
                            step="0.0001"
                            placeholder="139.6503"
                            value={newLocation.lon}
                            onChange={(e) =>
                              setNewLocation({
                                ...newLocation,
                                lon: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          placeholder="Asia/Tokyo"
                          value={newLocation.timezone}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              timezone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAdd}>Add Location</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isEditing={editingId === location.id}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        ))}
      </div>
    </div>
  );
}

interface LocationCardProps {
  location: Location;
  isEditing: boolean;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, data: Partial<Location>) => void;
  onCancel: () => void;
}

function LocationCard({
  location,
  isEditing,
  onDelete,
  onSetDefault,
  onEdit,
  onSave,
  onCancel,
}: LocationCardProps) {
  const [editData, setEditData] = useState(location);

  if (isEditing) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Edit Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${location.id}`}>Name</Label>
            <Input
              id={`edit-name-${location.id}`}
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-lat-${location.id}`}>Lat</Label>
              <Input
                id={`edit-lat-${location.id}`}
                type="number"
                step="0.0001"
                value={editData.lat}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    lat: Number.parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-lon-${location.id}`}>Lon</Label>
              <Input
                id={`edit-lon-${location.id}`}
                type="number"
                step="0.0001"
                value={editData.lon}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    lon: Number.parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor={`edit-timezone-${location.id}`}>Timezone</Label>
              <Input
                id={`edit-timezone-${location.id}`}
                value={editData.timezone}
                onChange={(e) =>
                  setEditData({ ...editData, timezone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => location.id && onSave(location.id, editData)}
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
              onClick={onCancel}
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{location.name}</CardTitle>
          </div>
          {location.isDefault && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Timezone: {location.timezone}
          </p>
          <div className="flex gap-2 pt-2">
            {!location.isDefault && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() =>
                  location.id ? onSetDefault(location.id) : undefined
                }
              >
                Set Default
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => (location.id ? onEdit(location.id) : undefined)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                  disabled={location.isDefault}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your weather tracking location.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      location.id ? onDelete(location.id) : undefined
                    }
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
