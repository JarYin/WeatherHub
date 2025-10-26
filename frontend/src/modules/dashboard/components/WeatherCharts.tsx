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
import { useEffect, useState } from "react";
import { fetchLocations } from "@/modules/locations/api/locationApi";
import { Location } from "@/modules/locations/type";
import { weatherAPI } from "../api/weather";
import { toast } from "sonner";
import { CloudRain, Droplet, Thermometer, Wind } from "lucide-react";
import { DailySummary, Weather } from "@/lib/type";
import timezone from "@/lib/timezone";
import { getSevenDates } from "../lib/seven-date";
import { Button } from "@/components/animate-ui/components/buttons/button";

export default function WeatherCharts() {
  const [location, setLocation] = useState<Location[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [hourlyData, setHourlyData] = useState<Weather[]>([]);
  const [dailyData, setDailyData] = useState<DailySummary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [ingestState, setIngestState] = useState(false);

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
        setLocation(normalized);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }
    fetchDataLocations();
  }, []);

  useEffect(() => {
    async function fetchWeatherHourly() {
      if (location.length === 0) return;

      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);

      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);

      const last7Days = getSevenDates(selectedDate).days;

      const dailyStart = last7Days[0];
      const dailyEnd = new Date(selectedDate);
      dailyEnd.setHours(23, 59, 59, 999);
      try {
        const loc = location.find((l) => l.isDefault) ?? location[0];
        if (!loc?.id) {
          console.warn("Location has no id, aborting daily fetch.");
          return;
        }
        const response = await weatherAPI.getHourly(
          loc.id,
          selectedDateStart.toISOString(),
          selectedDateEnd.toISOString()
        );

        if (!response || response.length === 0) {
          toast.error(
            "No hourly weather data returned for the default location."
          );
        }

        setHourlyData(response);

        const responseDaily = await weatherAPI.getDaily(
          loc.id,
          dailyStart.toISOString(),
          dailyEnd.toISOString()
        );

        console.log("Daily weather data:", responseDaily);

        if (!responseDaily || responseDaily.length === 0) {
          toast.error(
            "No daily weather data returned for the default location."
          );
        }

        setDailyData(responseDaily);
      } catch (error) {
        console.error("Error fetching hourly weather data:", error);
        toast.error("Failed to fetch hourly weather data.");
      }
    }
    fetchWeatherHourly();
  }, [location, selectedDate]);

  useEffect(() => {
    if (location.length === 0) return;

    const fetchLatestWeather = async () => {
      const loc = location.find((l) => l.isDefault) ?? location[0];
      if (!loc?.id) return;

      try {
        const response = await weatherAPI.getLatest(loc.id);
        if (response) {
          setWeather(response as Weather);
          console.log("Latest weather data updated:", response);
        }
      } catch (error) {
        console.error("Error fetching latest weather data:", error);
      }
    };

    const intervalId = setInterval(fetchLatestWeather, 60000);

    return () => clearInterval(intervalId);
  }, [location]);

  useEffect(() => {
    async function fetchIngestWeatherData() {
      console.log("Ingest state changed:", ingestState);
      if (location.length === 0) return;

      try {
        const loc = location.find((l) => l.isDefault) ?? location[0];
        if (!loc) {
          toast.error("No default location found for ingesting weather data.");
          return;
        }

        if (!loc?.id) return;

        await weatherAPI.ingestWeatherData(loc);
        const response = await weatherAPI.getLatest(loc.id);
        if (response) {
          setWeather(response as Weather);
          toast.success("Weather data ingested successfully.");
          console.log("Ingested weather data for location:", loc);
        }
      } catch (error) {
        console.error("Error ingesting weather data for default location:", error);
      }
    }
    fetchIngestWeatherData();
  }, [ingestState]);

  async function showLocationWeather(location: Location) {
    console.log("Selected location in WeatherCharts:", location);

    // Use selected date for data fetching
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const last7Days = getSevenDates(selectedDate).days;

    const dailyStart = last7Days[0];
    const dailyEnd = new Date(selectedDate);
    dailyEnd.setHours(23, 59, 59, 999);

    try {
      if (!location?.id) {
        console.warn("Selected location has no id, aborting fetch.");
        return;
      }
      const response = await weatherAPI.getLatest(location.id);

      if (!response) {
        toast.error("No weather data returned for the selected location.");
      }

      const weather = await weatherAPI.getHourly(
        location.id,
        selectedDateStart.toISOString(),
        selectedDateEnd.toISOString()
      );

      const daily = await weatherAPI.getDaily(
        location.id,
        dailyStart.toISOString(),
        dailyEnd.toISOString()
      );

      setWeather(response as Weather);
      setHourlyData(weather);
      setDailyData(daily);
    } catch (error) {
      console.error("Error fetching weather data for location:", error);
    }
  }

  const formattedHourlyData = hourlyData.map((h) => {
    const ts = h.timestamp ? new Date(h.timestamp) : null;
    const time = ts
      ? ts.toLocaleTimeString("en-EN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone().split(" ")[0],
        })
      : "";
    return {
      time,
      temp: Number((h as any).temperature ?? (h as any).temp ?? 0),
      humidity: Number((h as any).humidity ?? 0),
      wind: Number((h as any).wind_speed ?? (h as any).wind ?? 0),
    };
  });

  const formattedSummaryData = dailyData.map((d) => {
    const ts = d.date ? new Date(d.date) : null;
    const date = ts
      ? ts.toLocaleDateString("en-EN", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: timezone().split(" ")[0],
        })
      : "";
    return {
      date,
      temp_min: Number((d as any).temp_min ?? 0),
      temp_max: Number((d as any).temp_max ?? 0),
      rain_total: Number((d as any).rain_total ?? 0),
    };
  });

  return (
    <>
      <div className="mb-4 flex gap-4 items-center">
        <div className="flex-1">
          <SearchLocation
            locations={location}
            onLocationSelect={showLocationWeather}
          />
        </div>
        <Button
          variant={"outline"}
          onClick={() => setIngestState(prev => !prev)}
        >
          Fetch
        </Button>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <CardWeather weather={weather} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
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
                data={formattedHourlyData}
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

        {/* Humidity & Wind Speed */}
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
                data={formattedHourlyData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#9ca3af"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
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
                  activeDot={{ r: 5 }}
                  name="Humidity (%)"
                />
                <Line
                  type="monotone"
                  dataKey="wind"
                  stroke="#008000"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Wind (m/s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
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
                data={formattedSummaryData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  stroke="#9ca3af"
                />
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
      </div>
    </>
  );
}

function CardWeather({ weather }: { weather: Weather | null }) {
  if (weather == null) {
    return (
      <div className="mb-4 grid grid-cols-1">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent>
            <div className="h-fit flex justify-center items-center">
              <h1 className="text-gray-500">No data</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4 flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Temperature</CardTitle>
          <Thermometer className="w-4 h-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold">
            {weather.temperature?.toFixed(1)}°C
          </h1>
          <p className="text-muted-foreground text-xs">
            Updated:{" "}
            {new Date(weather.timestamp).toLocaleString("en-EN", {
              timeZone: timezone().split(" ")[0],
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4 flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Humidity</CardTitle>
          <Droplet className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold">{weather.humidity}%</h1>
          <p className="text-muted-foreground text-xs">
            Updated:{" "}
            {new Date(weather.timestamp).toLocaleString("en-EN", {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4 flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Rainfall</CardTitle>
          <CloudRain className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold">{weather.rain_mm} mm</h1>
          <p className="text-muted-foreground text-xs">
            Updated:{" "}
            {new Date(weather.timestamp).toLocaleString("en-EN", {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4 flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Wind Speed</CardTitle>
          <Wind className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-bold">
            {weather.wind_speed?.toFixed(2)} m/s
          </h1>
          <p className="text-muted-foreground text-xs">
            {new Date(weather.timestamp).toLocaleString("en-EN", {
              timeZone: "Asia/Bangkok",
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
