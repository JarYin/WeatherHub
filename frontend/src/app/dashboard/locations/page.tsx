import LocationsManager from '@/modules/locations/components/Location';
export default function LocationsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Manage Locations</h1>
      <p className='text-muted-foreground'>Add, edit, and organize your weather tracking locations</p>
      <LocationsManager />
    </div>
  );
}
