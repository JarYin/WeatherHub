import LocationsManager from '@/modules/locations/components/Location';
export default function LocationsPage() {
  return (
    <div className="max-w-7xl mx-auto mt-4">
      <h1 className="text-4xl font-bold mb-4 max-md:text-center">Manage Locations</h1>
      <p className='text-muted-foreground max-md:text-center'>Add, edit, and organize your weather tracking locations</p>
      <LocationsManager />
    </div>
  );
}
