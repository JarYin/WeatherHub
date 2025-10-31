import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, CloudRain, Droplet, Thermometer, Wind } from "lucide-react";
import type { Location } from "@/modules/locations/type";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Weather } from "@/lib/type";
import React from "react";

export default function CompareWeather({
  location,
  weathers,
  weatherHourly,
}: {
  location: Location[];
  weathers: Weather[];
  weatherHourly: Weather[][];
}) {
  return (
    <>
      <CardWeather
        location={location}
        weathers={weathers}
        weatherHourly={weatherHourly}
      />
    </>
  );
}

interface CardWeatherProps {
  location: Location[];
  weathers: Weather[];
  weatherHourly: Weather[][];
}

function CardWeather({ location, weathers, weatherHourly }: CardWeatherProps) {
  const mergedData = (() => {
    const dataMap = new Map<string, any>();

    weatherHourly.forEach((weathers, locIndex) => {
      const loc = location[locIndex];
      const locName = loc?.location?.name || `Location-${locIndex}`;
      const tz = loc?.location?.timezone || "UTC";

      weathers.forEach((w) => {
        const utcKey = new Date(w.timestamp).toISOString();

        // แปลงเวลาแสดงเป็น local ตาม timezone จริงของ location
        const localTime = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: tz,
        }).format(new Date(w.timestamp));

        if (!dataMap.has(utcKey)) {
          dataMap.set(utcKey, { utc: utcKey, time: localTime });
        }

        const entry = dataMap.get(utcKey);
        entry[`${locName}_temp`] = w.temperature?.toFixed(1);
        entry[`${locName}_rain`] = w.rain_mm?.toFixed(1) ?? 0;
      });
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.utc).getTime() - new Date(b.utc).getTime()
    );
  })();
  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {weathers.map((weather, index) => (
          <Card
            key={index}
            className="w-full shadow-sm hover:shadow-md transition-shadow bg-transparent border border-border max-w-[400px]"
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold">
                  {location[index]?.location?.name}
                </h1>
                <MapPin className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="flex items-center gap-2 text-muted-foreground">
                    <Thermometer className="w-4 h-4" />
                    Temperature:
                  </h1>
                  <span className="font-semibold">
                    {weather.temperature?.toFixed(1)}°C
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="flex items-center gap-2 text-muted-foreground">
                    <Droplet className="w-4 h-4" />
                    Humidity:
                  </h1>
                  <span className="font-semibold">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="flex items-center gap-2 text-muted-foreground">
                    <Wind className="w-4 h-4" />
                    Wind Speed:
                  </h1>
                  <span className="font-semibold">
                    {weather.wind_speed?.toFixed(2)} km/h
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h1 className="flex items-center gap-2 text-muted-foreground">
                    <CloudRain className="w-4 h-4" />
                    Rainfall:
                  </h1>
                  <span className="font-semibold">
                    {weather.rain_mm?.toFixed(2)} mm
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 w-full shadow-sm hover:shadow-md transition-shadow bg-transparent border border-border">
        <CardHeader>
          <h2 className="text-lg font-semibold">Comparison Summary</h2>
          <p className="text-sm text-muted-foreground">
            Comparison summary will be displayed here.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mergedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip

                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                labelStyle={{ color: "#000" }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />

              {location.map((loc, index) => {
                const name = loc.location?.name || `Location-${index}`;
                return (
                  <React.Fragment key={index}>
                    <Bar
                      key={`${name}_temp`}
                      dataKey={`${name}_temp`}
                      name={`${name} Temperature (°C)`}
                      fill="#ef4444"
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      key={`${name}_rain`}
                      dataKey={`${name}_rain`}
                      name={`${name} Rainfall (mm)`}
                      fill="#3b82f6"
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    />
                  </React.Fragment>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
