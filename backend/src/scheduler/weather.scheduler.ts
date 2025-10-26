import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { fetchWeatherApi } from 'openmeteo';
import { localTimeISO } from '../lib/timezone';

const prisma = new PrismaClient();

/**
 * ฟังก์ชันหลักที่ดึงข้อมูลและบันทึกลง DB
 */
async function fetchAndSaveWeatherForLocation(locationId: string) {
    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    if (!loc) return;

    console.log(`[${localTimeISO()}] Fetching current weather for ${loc.name}...`);

    try {
        // เรียก Current Weather API ของ open-meteo
        const params = {
            latitude: loc.lat,
            longitude: loc.lon,
            current: ["temperature_2m", "relative_humidity_2m", "precipitation", "windspeed_10m", "weathercode"],
            timezone: "auto"
        };
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        const data = responses[0];

        if (!data?.current) {
            console.warn(`No current weather data returned for location ${loc.name} (${loc.id}), skipping.`);
            return;
        }

        const current = data.current();

        if (!current) {
            console.warn(`No current weather data returned for location ${loc.name} (${loc.id}), skipping.`);
            return;
        }

        if (!current.time) {
            console.warn(`No timestamp in current weather data for location ${loc.name} (${loc.id}), skipping.`);
            return;
        }

        const record = {
            location_id: loc.id,
            timestamp: new Date(Number(current.time()) * 1000),
            temperature: current.variables(0)?.value() ?? null,
            humidity: current.variables(1)?.value() ?? null,
            rain_mm: current.variables(2)?.value() ?? null,
            wind_speed: current.variables(3)?.value() ?? null,
            weather_code: current.variables(4)?.value() ?? null,
            granularity: 'hourly',
        };

        await prisma.weather.create({ data: record });
        console.log(`✅ Saved current weather for ${loc.name}`);
    } catch (err) {
        console.error(`❌ Error fetching current weather for ${loc.name}:`, err);
    }
}

async function summaryWeather(locationId: string, date: string) {
    try {
        if (!locationId || !date)
            throw new Error("locationId and date are required");

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const response = await prisma.weather.findMany({
            where: {
                location_id: String(locationId),
                timestamp: {
                    gte: targetDate,
                    lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
                },
                granularity: 'hourly'
            },
            orderBy: { timestamp: 'asc' }
        });

        if (response.length === 0) {
            throw new Error("No weather data found for the specified date");
        }

        const temperatures = response.map(r => r.temperature).filter(t => t !== null) as number[];
        const winds = response.map(r => r.wind_speed).filter(w => w !== null) as number[];
        const rainfalls = response.map(r => r.rain_mm).filter(rf => rf !== null) as number[];

        const summary = {
            date: targetDate.toISOString().split('T')[0],
            temperature: {
                min: Math.min(...temperatures),
                max: Math.max(...temperatures),
            },
            rainfall: {
                total: rainfalls.reduce((a, b) => a + b, 0)
            },
            wind_max: Math.max(...winds)
        };

        const summarySubmit = await prisma.dailySummary.upsert({
            where: {
                locationId_date: {
                    locationId: String(locationId),
                    date: targetDate,
                }
            },
            update: {
                temp_min: summary.temperature.min,
                temp_max: summary.temperature.max,
                rain_total: summary.rainfall.total,
                wind_max: summary.wind_max,
            },
            create: {
                locationId: String(locationId),
                date: targetDate,
                temp_min: summary.temperature.min,
                temp_max: summary.temperature.max,
                rain_total: summary.rainfall.total,
                wind_max: summary.wind_max,
            }
        });
        console.log(`✅ Daily summary saved for location ${locationId} on ${summary.date}`);
    } catch (err) {
        console.error(`❌ Error summarizing weather for location ${locationId} on ${date}:`, err);
    }
}

/**
 * Scheduler หลัก
 * รันทุก ๆ 1–3 ชั่วโมง แล้วสุ่ม interval per location
 */
export function startWeatherScheduler() {
    console.log("🌦️ Weather Scheduler started...");

    prisma.location.findMany({ where: { isActive: true } }).then((locations) => {
        locations.forEach((loc) => {
            const cronExpr = `0 * * * *`;
            console.log(`📅 Schedule for ${loc.name}: ${cronExpr}`);

            cron.schedule(cronExpr, async () => {
                console.log(`🕒 Running scheduled job for ${loc.name} at ${localTimeISO()}`);
                try {
                    await fetchAndSaveWeatherForLocation(loc.id);
                } catch (err) {
                    console.error(`❌ Cron job error for ${loc.name}:`, err);
                }
            });
            
        });
    });
}

export function startSummaryWeatherScheduler() {
    console.log("🌦️ Weather Summary Scheduler started...");

    prisma.location.findMany({ where: { isActive: true } }).then((locations) => {
        locations.forEach((loc) => {
            const cronExpr = `5 23 * * *`;
            console.log(`📅 Summary Schedule for ${loc.name}: ${cronExpr}`);

            cron.schedule(cronExpr, async () => {
                console.log(`🕒 Running daily summary job for ${loc.name} at ${localTimeISO()}`);
                try {
                    await summaryWeather(loc.id, localTimeISO());
                } catch (err) {
                    console.error(`❌ Daily summary job error for ${loc.name}:`, err);
                }
            });
            summaryWeather(loc.id, localTimeISO()).catch((err) => {
                console.error(`❌ Initial daily summary error for ${loc.name}:`, err);
            });
        });
    });
}
