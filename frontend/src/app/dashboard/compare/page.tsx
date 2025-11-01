import SelectedLocations from "@/modules/compare/components/SelectedLocations";

export default function comparePage() {
    return (
        <div className="max-w-7xl mx-auto mt-4">
            <h1 className="text-4xl font-bold mb-4 max-md:text-center">Compare Locations</h1>
            <p className="text-muted-foreground mb-8 max-md:text-center">Compare weather data across multiple cities side by side</p>
            <SelectedLocations />
        </div>
    );
}