import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fetchWeatherApi } from 'openmeteo';
import { Parser } from 'json2csv';
import fetch from 'node-fetch';
import { Location } from 'models/location';

const prisma = new PrismaClient();

export class WeatherController {
    async getLatest(req: Request, res: Response) {
        const { location_id } = req.query;
        if (!location_id) return res.status(400).json({ message: "location_id is required" });

        const startOfHour = new Date();
        startOfHour.setMinutes(0, 0, 0);
        const startOfNextHour = new Date(startOfHour);
        startOfNextHour.setHours(startOfHour.getHours() + 1);

        const latest = await prisma.weather.findFirst({
            where: {
                location_id: String(location_id),
                timestamp: { gte: startOfHour, lt: startOfNextHour }
            },
            orderBy: { timestamp: 'desc' },
        });

        if (!latest) return res.status(404).json({ message: "No weather data found for the current hour" });
        // res.set('Cache-Control', 'public, max-age=60');
        return res.json(latest);
    }

    async getHourly(req: Request, res: Response) {
        const { location_id, from, to } = req.query;
        if (!location_id || !from || !to)
            return res.status(400).json({ message: "location_id, from, to required" });

        const data = await prisma.weather.findMany({
            where: {
                location_id: String(location_id),
                timestamp: { gte: new Date(from as string), lte: new Date(to as string) },
                granularity: 'hourly'
            },
            orderBy: { timestamp: 'asc' }
        });

        return res.json(data);
    }

    async getDaily(req: Request, res: Response) {
        const { location_id, from, to } = req.query;
        if (!location_id || !from || !to)
            return res.status(400).json({ message: "location_id, from, to required" });

        const data = await prisma.dailySummary.findMany({
            where: {
                locationId: String(location_id),
                date: { gte: new Date(from as string), lte: new Date(to as string) },
            },
            orderBy: { date: 'asc' }
        });

        return res.json(data);
    }

    async exportCSV(req: Request, res: Response) {
        const { location_id, from, to, type } = req.query;
        if (!location_id || !from || !to)
            return res.status(400).json({ message: "location_id, from, to required" });

        const data = await prisma.weather.findMany({
            where: {
                location_id: String(location_id),
                timestamp: { gte: new Date(from as string), lte: new Date(to as string) },
                granularity: type === 'daily' ? 'daily' : 'hourly'
            },
            orderBy: { timestamp: 'asc' }
        });

        const parser = new Parser();
        const csv = parser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`weather_${location_id}_${type || 'hourly'}.csv`);
        res.send(csv);
    }

    // ดึงข้อมูลจาก open-meteo และบันทึกลงฐานข้อมูล
    async fetchAndSaveWeather(req: Request, res: Response) {
        const locations = await prisma.location.findMany();

        for (const loc of locations) {
            const weatherResponse = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
                latitude: loc.lat,
                longitude: loc.lon,
                hourly: ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "weathercode"],
                daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weathercode"],
                timezone: "auto",
            });

            const w = weatherResponse[0];
            if (!w) {
                console.warn(`No weather data returned for location ${loc.id}, skipping.`);
                continue;
            }

            // hourly
            const hourly = w.hourly();
            if (!hourly) {
                console.warn(`No hourly data for location ${loc.id}, skipping.`);
                continue;
            }

            // ensure expected variables exist
            const varTemp = hourly.variables(0);
            const varHumidity = hourly.variables(1);
            const varPrecip = hourly.variables(2);
            const varWind = hourly.variables(3);
            const varCode = hourly.variables(4);
            if (!varTemp || !varHumidity || !varPrecip || !varWind || !varCode) {
                console.warn(`Missing hourly variables for location ${loc.id}, skipping.`);
                continue;
            }

            const times = hourly.time() as unknown as any[];
            const temp = varTemp.valuesArray();
            const humidity = varHumidity.valuesArray();
            const precip = varPrecip.valuesArray();
            const wind = varWind.valuesArray();
            const code = varCode.valuesArray();

            if (!times || !temp || !humidity || !precip || !wind || !code) {
                console.warn(`Incomplete hourly data arrays for location ${loc.id}, skipping.`);
                continue;
            }

            const records = times.map((t: any, i: number) => ({
                location_id: loc.id,
                timestamp: new Date(t),
                temperature: Number(temp[i] ?? 0),
                humidity: Number(humidity[i] ?? 0),
                rain_mm: Number(precip[i] ?? 0),
                wind_speed: Number(wind[i] ?? 0),
                weather_code: Number(code[i] ?? 0),
                granularity: 'hourly'
            }));

            if (records.length > 0) {
                await prisma.weather.createMany({ data: records, skipDuplicates: true });
            }
        }

        res.json({ message: "Weather data fetched and saved." });
    }

    async insertWeatherByLocation(location: Location | any) {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0); // 00:00 ของวันนี้

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode&timezone=UTC`;
        const res = await fetch(url);
        const data = await res.json();

        const hourly = data.hourly;
        if (!hourly || !Array.isArray(hourly.time)) {
            throw new Error("No hourly data returned from API");
        }

        const times = hourly.time;
        const temp = hourly.temperature_2m;
        const humidity = hourly.relative_humidity_2m;
        const precip = hourly.precipitation;
        const wind = hourly.windspeed_10m;
        const code = hourly.weathercode;

        type WeatherRecord = {
            location_id: string;
            timestamp: Date;
            temperature: number;
            humidity: number;
            rain_mm: number;
            wind_speed: number;
            weather_code: number;
            granularity: "hourly" | "daily";
        };

        const records: WeatherRecord[] = times
            .map((t: string, i: number): WeatherRecord => ({
                location_id: String(location.id),
                timestamp: new Date(t),
                temperature: Number(temp?.[i] ?? 0),
                humidity: Number(humidity?.[i] ?? 0),
                rain_mm: Number(precip?.[i] ?? 0),
                wind_speed: Number(wind?.[i] ?? 0),
                weather_code: Number(code?.[i] ?? 0),
                granularity: "hourly",
            }))
            .filter((record: WeatherRecord) => record.timestamp >= todayStart && record.timestamp <= now); // กรองเฉพาะ 00:00 - ปัจจุบัน

        if (records.length > 0) {
            await prisma.weather.createMany({ data: records, skipDuplicates: true });
        }

        return { hourly: records };
    }

    async fetchWeatherNowByLocation(req: Request, res: Response) {
        try {
            const { location } = req.body;
            if (!location) {
                return res.status(400).json({ error: "Location is required" });
            }

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Weather API failed: ${response.status}`);
            }

            const data = await response.json();
            const current = data.current;

            if (!current) {
                throw new Error("No current data returned from API");
            }

            const record = {
                location_id: String(location.id),
                timestamp: new Date(current.time),
                temperature: Number(current.temperature_2m ?? 0),
                humidity: Number(current.relative_humidity_2m ?? 0),
                rain_mm: Number(current.precipitation ?? 0),
                wind_speed: Number(current.wind_speed_10m ?? 0),
                weather_code: Number(current.weather_code ?? 0),
                granularity: "hourly",
            };

            const result = await prisma.weather.upsert({
                where: {
                    location_id_timestamp_granularity: {
                        location_id: record.location_id,
                        timestamp: record.timestamp,
                        granularity: record.granularity,
                    },
                },
                update: record,
                create: record,
            });

            if(!result) {
                throw new Error("Failed to upsert weather record");
            }

            return res.status(200).json({
                message: "Weather data updated",
                current: record,
            });
        } catch (err: any) {
            console.error("fetchWeatherNowByLocation error:", err);
            return res.status(500).json({ error: err.message });
        }
    }
}
