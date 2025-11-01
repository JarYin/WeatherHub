import WeatherCharts from "@/modules/dashboard/components/WeatherCharts";

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto mt-4">
            <h1 className="text-4xl font-bold max-md:text-center">Dashboard</h1>
            <p className="text-muted-foreground mb-2 mt-2 max-md:text-center">Real-time weather monitoring and historical data</p>
            <WeatherCharts />
        </div>
    );
}