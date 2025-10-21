import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "WeatherHub Dashboard",
  description:
    "Track weather data across multiple cities with real-time updates, forecasts, and analytics on the WeatherHub Dashboard.",
  keywords: [
    "weather",
    "dashboard",
    "forecast",
    "cities",
    "real-time",
    "tracking",
  ],
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        {children}
        <Toaster />
      </ThemeProvider>
    </>
  );
}
