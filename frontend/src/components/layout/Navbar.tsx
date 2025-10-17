"use client";
import {
  ChartColumnStacked,
  Cloud,
  LogOut,
  MapPin,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../animate-ui/components/buttons/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme,setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Button variant="outline" className="mr-4 w-20 h-10" disabled />;
  }
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <div className="flex justify-between items-center p-3 bg-transparent shadow">
      <div className="flex items-center">
        <Cloud className="w-8 h-8" />
        <span className="ml-2 text-2xl font-extrabold">WeatherHub</span>

        <div className="flex items-center gap-2 ml-5 hover:bg-gray-100 p-2 rounded cursor-pointer">
          <Cloud className="w-4 h-4" />
          <span className="font-bold">Dashboard</span>
        </div>

        <div className="flex items-center gap-2 ml-5 hover:bg-gray-100 p-2 rounded cursor-pointer">
          <MapPin className="w-4 h-4" />
          <span className="font-bold">Locations</span>
        </div>

        <div className="flex items-center gap-2 ml-5 hover:bg-gray-100 p-2 rounded cursor-pointer">
          <ChartColumnStacked className="w-4 h-4" />
          <span className="font-bold">Compare</span>
        </div>
      </div>

      <div className="flex items-center">
        <div>
          <Button variant="outline" className="mr-4" onClick={toggleTheme}>
            {theme === "light" ? (
              <>
                <Moon className="w-5 h-5 mr-2" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-2" />
                <span>Light</span>
              </>
            )}
          </Button>
        </div>
        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
          <LogOut className="w-5 h-5 mr-2" />
          <span className="font-bold">Sign Out</span>
        </div>
      </div>
    </div>
  );
}
