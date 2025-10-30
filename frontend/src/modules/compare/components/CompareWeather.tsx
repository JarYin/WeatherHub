import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, CloudRain, Droplet, Thermometer, Wind } from "lucide-react";
import type { Location } from "@/modules/locations/type";

export default function CompareWeather({ location }: { location: Location[] }) {
  return (
    <>
      <CardWeather location={location} />
    </>
  );
}

interface CardWeatherProps {
    location: Location[];
}

function CardWeather({ location }: CardWeatherProps) {
  return (
    <>
      <Card className="w-full shadow-sm hover:shadow-md transition-shadow bg-transparent border border-border max-w-[400px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold">Chiang mai</h1>
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
              <span className="font-semibold">30°C</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h1 className="flex items-center gap-2 text-muted-foreground">
                <Droplet className="w-4 h-4" />
                Humidity:
              </h1>
              <span className="font-semibold">60%</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h1 className="flex items-center gap-2 text-muted-foreground">
                <Wind className="w-4 h-4" />
                Wind Speed:
              </h1>
              <span className="font-semibold">10 km/h</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h1 className="flex items-center gap-2 text-muted-foreground">
                <CloudRain className="w-4 h-4" />
                Rainfall:
              </h1>
              <span className="font-semibold">5 mm</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
