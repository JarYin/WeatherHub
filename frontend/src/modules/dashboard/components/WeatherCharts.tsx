"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SearchLocation from "./SearchLocation";
import DatePicker from "./DatePicker";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchLocations } from "@/modules/locations/api/locationApi";
import { Location } from "@/modules/locations/type";
import { weatherAPI } from "../api/weather";
import { toast } from "sonner";
import { CloudRain, Droplet, Settings2, Thermometer, Wind } from "lucide-react";
import { DailySummary, Weather } from "@/lib/type";
import timezone from "@/lib/timezone";
import { getSevenDates } from "../lib/seven-date";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV } from "@/lib/exportToCSV";

const getDateRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatTime = (timestamp: string | Date | null) => {
  if (!timestamp) return "";
  const ts = new Date(timestamp);
  return ts.toLocaleTimeString("en-EN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone().split(" ")[0],
  });
};

const formatDate = (date: string | Date | null) => {
  if (!date) return "";
  const ts = new Date(date);
  return ts.toLocaleDateString("en-EN", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: timezone().split(" ")[0],
  });
};

export default function WeatherCharts() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [hourlyData, setHourlyData] = useState<Weather[]>([]);
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [loadingIngest, setLoadingIngest] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 6,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchLocations(
          pagination.page,
          pagination.limit
        );
        const normalized: Location[] = response.data.map((r: any) => ({
          id: r.id,
          name: r.name ?? "",
          lat: Number(r.lat ?? 0),
          lon: Number(r.lon ?? 0),
          timezone: r.timezone ?? "UTC",
          isDefault: !!r.isDefault,
        }));
        setLocations(normalized);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.pagination.totalPages,
        }));
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch weather data when location or date changes
  const fetchWeatherData = useCallback(async () => {
    if (!selectedLocation?.id) return;

    const { start: hourlyStart, end: hourlyEnd } = getDateRange(selectedDate);
    const last7Days = getSevenDates(selectedDate).days;
    const dailyStart = last7Days[0];
    const dailyEnd = new Date(selectedDate);
    dailyEnd.setHours(23, 59, 59, 999);

    try {
      const [hourly, daily, latest] = await Promise.all([
        weatherAPI.getHourly(
          selectedLocation.id,
          hourlyStart.toISOString(),
          hourlyEnd.toISOString()
        ),
        weatherAPI.getDaily(
          selectedLocation.id,
          dailyStart.toISOString(),
          dailyEnd.toISOString()
        ),
        weatherAPI.getLatest(selectedLocation.id),
      ]);

      setHourlyData(hourly || []);
      setDailyData(daily || []);
      if (latest) setCurrentWeather(latest as Weather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Failed to fetch weather data");
    }
  }, [selectedLocation, selectedDate]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    if (!selectedLocation?.id) return;

    const fetchLatest = async () => {
      try {
        const locationId = selectedLocation.id;
        if (!locationId) return;
        const response = await weatherAPI.getLatest(locationId);
        if (response) setCurrentWeather(response as Weather);
      } catch (error) {
        console.error("Error fetching latest weather:", error);
      }
    };

    const intervalId = setInterval(fetchLatest, 60000);
    return () => clearInterval(intervalId);
  }, [selectedLocation?.id]);

  const handleIngestData = useCallback(async () => {
    if (!selectedLocation?.id) return;

    setLoadingIngest(true);
    try {
      const ingest = await weatherAPI.ingestWeatherData(selectedLocation);
      if (ingest.status === 409) {
        toast.error("Too many requests, please try again later.");
        return;
      }
      const locationId = selectedLocation.id;
      if (locationId) {
        const response = await weatherAPI.getLatest(locationId);
        if (response) {
          setCurrentWeather(response as Weather);
          toast.success("Weather data ingested successfully");
        }
      }
    } catch (error) {
      console.error("Error ingesting weather data:", error);
      toast.error("Failed to ingest weather data");
    } finally {
      setLoadingIngest(false);
    }
  }, [selectedLocation]);

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const formattedHourlyData = useMemo(
    () =>
      hourlyData.map((h) => ({
        time: formatTime(h.timestamp),
        temp: Number((h as any).temperature ?? (h as any).temp ?? 0),
        humidity: Number((h as any).humidity ?? 0),
        wind: Number((h as any).wind_speed ?? (h as any).wind ?? 0),
      })),
    [hourlyData]
  );

  const formattedDailyData = useMemo(
    () =>
      dailyData.map((d) => ({
        date: formatDate(d.date),
        temp_min: Number((d as any).temp_min ?? 0),
        temp_max: Number((d as any).temp_max ?? 0),
        rain_total: Number((d as any).rain_total ?? 0),
      })),
    [dailyData]
  );

  const csvData = useMemo(
    () =>
      dailyData.map((d) => ({
        Date: formatDate(d.date),
        Location: (d.location as Location).name,
        "Max Temperature (°C)": d.temp_max,
        "Min Temperature (°C)": d.temp_min,
        "Rain (mm)": d.rain_total,
        "Wind Speed (m/s)": d.wind_max,
      })),
    [dailyData]
  );

  const handleExportCSV = useCallback(() => {
    const locationName = csvData.find((v) => v.Location)?.Location || "Unknown";
    const dateStr = selectedDate.toISOString().split("T")[0];
    exportToCSV(csvData, {
      filename: `WeatherDaily-${locationName}-${dateStr}`,
    });
  }, [csvData, selectedDate]);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchLocation
            locations={locations}
            onLocationSelect={handleLocationSelect}
            pagination={pagination}
          />
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>

              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, prev.totalPages),
                  }))
                }
                disabled={pagination.page === pagination.totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:mt-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Settings2 className="h-4 w-4" /> Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <Button
                  variant="ghost"
                  onClick={handleIngestData}
                  disabled={loadingIngest || !selectedLocation}
                  className="w-full"
                >
                  {loadingIngest ? "Loading..." : "Fetch Now"}
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExportCSV}
                className="cursor-pointer"
              >
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      <WeatherCards weather={currentWeather} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureChart data={formattedHourlyData} />
        <HumidityWindChart data={formattedHourlyData} />
        <WeeklySummaryChart data={formattedDailyData} />
      </div>
    </>
  );
}

function TemperatureChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Temperature Trend
        </CardTitle>
        <CardDescription className="text-sm">Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              label={{
                value: "°C",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#000" }}
              itemStyle={{ color: "#000" }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#tempGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HumidityWindChart({ data }: { data: any[] }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Humidity & Wind Speed
        </CardTitle>
        <CardDescription className="text-sm">Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "10px 14px",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              labelStyle={{ color: "#000" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#8b07f0"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Humidity (%)"
            />
            <Line
              type="monotone"
              dataKey="wind"
              stroke="#008000"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              name="Wind (m/s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function WeeklySummaryChart({ data }: { data: any[] }) {
  return (
    <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Weekly Weather Summary
        </CardTitle>
        <CardDescription className="text-sm">
          Temperature range and rainfall for the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              labelStyle={{ color: "#000" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
              iconType="square"
            />
            <Bar
              dataKey="temp_max"
              fill="#ef4444"
              name="Max Temp (°C)"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey="temp_min"
              fill="#8b07f0"
              name="Min Temp (°C)"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey="rain_total"
              fill="#3b82f6"
              name="Rainfall (mm)"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function WeatherCards({ weather }: { weather: Weather | null }) {
  const tz = timezone().split(" ")[0];

  if (!weather) {
    return (
      <div className="mb-4">
        <Card className="shadow-sm">
          <CardContent className="flex justify-center items-center p-8">
            <h1 className="text-gray-500">No data available</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timestamp = new Date(weather.timestamp).toLocaleString("en-EN", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const cards = [
    {
      title: "Temperature",
      value: `${weather.temperature?.toFixed(1)}°C`,
      icon: Thermometer,
      color: "text-orange-500",
    },
    {
      title: "Humidity",
      value: `${weather.humidity}%`,
      icon: Droplet,
      color: "text-purple-500",
    },
    {
      title: "Rainfall",
      value: `${weather.rain_mm?.toFixed(2)} mm`,
      icon: CloudRain,
      color: "text-blue-500",
    },
    {
      title: "Wind Speed",
      value: `${weather.wind_speed?.toFixed(2)} m/s`,
      icon: Wind,
      color: "text-green-500",
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, color }) => (
        <Card
          key={title}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <Icon className={`w-4 h-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <h1 className="text-2xl font-bold">{value}</h1>
            <p className="text-muted-foreground text-xs">
              Updated: {timestamp}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
