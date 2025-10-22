import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WeatherHub - Your Weather Companion",
    template: "%s | WeatherHub"
  },
  description: "WeatherHub provides accurate real-time weather forecasts, detailed hourly and daily predictions, and interactive weather maps. Stay prepared with reliable weather updates for any location worldwide.",
  keywords: ["weather", "forecast", "weather app", "temperature", "precipitation", "weather updates", "meteorology"],
  authors: [{ name: "WeatherHub" }],
  creator: "WeatherHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WeatherHub - Your Weather Companion",
    description: "Accurate weather forecasts and real-time updates for locations worldwide.",
    siteName: "WeatherHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
