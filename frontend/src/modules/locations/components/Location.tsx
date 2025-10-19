"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Plus, Trash2, Edit2, Save, X, Map } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog"
import { LocationMapPicker } from "./LocationMapPicker"
import { Button } from "@/components/animate-ui/components/buttons/button"
import { Badge } from "@/components/ui/badge"

interface Location {
  id: number
  name: string
  lat: number
  lon: number
  timezone: string
  isDefault?: boolean
}

const initialLocations: Location[] = [
  { id: 1, name: "Chiang Mai", lat: 18.7883, lon: 98.9853, timezone: "Asia/Bangkok", isDefault: true },
  { id: 2, name: "Bangkok", lat: 13.7563, lon: 100.5018, timezone: "Asia/Bangkok" },
  { id: 3, name: "Phuket", lat: 7.8804, lon: 98.3923, timezone: "Asia/Bangkok" },
]

export default function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: "",
    lat: "",
    lon: "",
    timezone: "Asia/Bangkok",
  })

  const handleDelete = (id: number) => {
    setLocations(locations.filter((loc) => loc.id !== id))
  }

  const handleSetDefault = (id: number) => {
    setLocations(
      locations.map((loc) => ({
        ...loc,
        isDefault: loc.id === id,
      })),
    )
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleSave = (id: number, updatedData: Partial<Location>) => {
    setLocations(locations.map((loc) => (loc.id === id ? { ...loc, ...updatedData } : loc)))
    setEditingId(null)
  }

  const handleAdd = () => {
    if (newLocation.name && newLocation.lat && newLocation.lon) {
      const newLoc: Location = {
        id: Math.max(...locations.map((l) => l.id)) + 1,
        name: newLocation.name,
        lat: Number.parseFloat(newLocation.lat),
        lon: Number.parseFloat(newLocation.lon),
        timezone: newLocation.timezone,
      }
      setLocations([...locations, newLoc])
      setNewLocation({ name: "", lat: "", lon: "", timezone: "Asia/Bangkok" })
      setIsAddDialogOpen(false)
    }
  }

  const handleMapLocationSelect = (location: { name: string; lat: number; lon: number }) => {
    const newLoc: Location = {
      id: Math.max(...locations.map((l) => l.id)) + 1,
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      timezone: "UTC", // Default timezone, can be enhanced with timezone API
    }
    setLocations([...locations, newLoc])
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{locations.length} locations saved</p>
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
              <DialogDescription>Choose a method to add a new weather tracking location</DialogDescription>
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
                <LocationMapPicker onLocationSelect={handleMapLocationSelect} />
              </TabsContent>
              <TabsContent value="manual" className="mt-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Enter Location Details</CardTitle>
                    <CardDescription>Manually enter the coordinates and details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">City Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Tokyo"
                          value={newLocation.name}
                          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
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
                            onChange={(e) => setNewLocation({ ...newLocation, lat: e.target.value })}
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
                            onChange={(e) => setNewLocation({ ...newLocation, lon: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          placeholder="Asia/Tokyo"
                          value={newLocation.timezone}
                          onChange={(e) => setNewLocation({ ...newLocation, timezone: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
        {locations.map((location) => (
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
  )
}

interface LocationCardProps {
  location: Location
  isEditing: boolean
  onDelete: (id: number) => void
  onSetDefault: (id: number) => void
  onEdit: (id: number) => void
  onSave: (id: number, data: Partial<Location>) => void
  onCancel: () => void
}

function LocationCard({ location, isEditing, onDelete, onSetDefault, onEdit, onSave, onCancel }: LocationCardProps) {
  const [editData, setEditData] = useState(location)

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
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
                onChange={(e) => setEditData({ ...editData, lat: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-lon-${location.id}`}>Lon</Label>
              <Input
                id={`edit-lon-${location.id}`}
                type="number"
                step="0.0001"
                value={editData.lon}
                onChange={(e) => setEditData({ ...editData, lon: Number.parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1 gap-2" onClick={() => onSave(location.id, editData)}>
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-2 bg-transparent" onClick={onCancel}>
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
          <p className="text-sm text-muted-foreground">Timezone: {location.timezone}</p>
          <div className="flex gap-2 pt-2">
            {!location.isDefault && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => onSetDefault(location.id)}
              >
                Set Default
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => onEdit(location.id)}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={() => onDelete(location.id)}
              disabled={location.isDefault}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
