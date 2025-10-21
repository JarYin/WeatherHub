import WeatherCharts from "@/modules/dashboard/components/WeatherCharts";

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
            <WeatherCharts />
        </div>
    );
}