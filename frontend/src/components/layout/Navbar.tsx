"use client";

import {
  ChartColumnStacked,
  Cloud,
  LogOut,
  MapPin,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../animate-ui/components/buttons/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/modules/auth/api/signOutApi";
import Link from "next/link";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) {
    return <div className="h-16 w-full bg-transparent shadow" />;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const linkClass =
    "flex items-center gap-2 p-2 rounded-md font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors";

  return (
    <nav className="w-full max-w-full fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Cloud className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-lg sm:text-2xl font-extrabold whitespace-nowrap">WeatherHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
            <Link href="/dashboard" className={linkClass}>
              <Cloud className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/dashboard/locations" className={linkClass}>
              <MapPin className="w-4 h-4" />
              Locations
            </Link>
            <Link href="/dashboard/compare" className={linkClass}>
              <ChartColumnStacked className="w-4 h-4" />
              Compare
            </Link>

            <Button variant="outline" onClick={toggleTheme}>
              {theme === "light" ? (
                <>
                  <Moon className="w-5 h-5 mr-2" />
                  Dark
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 mr-2" />
                  Light
                </>
              )}
            </Button>

            <Button onClick={handleSignOut} className="flex items-center">
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
            <Cloud className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/locations" className={linkClass} onClick={() => setMenuOpen(false)}>
            <MapPin className="w-4 h-4" />
            Locations
          </Link>
          <Link href="/dashboard/compare" className={linkClass} onClick={() => setMenuOpen(false)}>
            <ChartColumnStacked className="w-4 h-4" />
            Compare
          </Link>

          <Button variant="outline" className="w-full" onClick={toggleTheme}>
            {theme === "light" ? (
              <>
                <Moon className="w-5 h-5 mr-2" />
                Dark
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-2" />
                Light
              </>
            )}
          </Button>

          <Button className="w-full" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
