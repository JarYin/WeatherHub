import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch'; // ถ้ายังไม่มี ให้ติดตั้ง: npm i node-fetch@2

const prisma = new PrismaClient();

/**
 * ฟังก์ชันหลักที่ดึงข้อมูลและบันทึกลง DB
 */
async function fetchAndSaveWeatherForLocation(locationId: string) {
    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    if (!loc) return;

    console.log(`[${new Date().toISOString()}] Fetching weather for ${loc.name}...`);

    try {
        // เรียก REST API ของ open-meteo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode&timezone=UTC`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.hourly || !Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
            console.warn(`No hourly data returned for location ${loc.name} (${loc.id}), skipping.`);
            return;
        }

        const hourly = data.hourly;
        const times: string[] = hourly.time;
        const temp: number[] = hourly.temperature_2m;
        const humidity: number[] = hourly.relative_humidity_2m;
        const precip: number[] = hourly.precipitation;
        const wind: number[] = hourly.windspeed_10m; // <-- ชื่อ field ตรงกับ API
        const code: number[] = hourly.weathercode;

        const records = times.map((t: string, i: number) => ({
            location_id: loc.id,
            timestamp: new Date(t),
            temperature: temp[i] ?? null,
            humidity: humidity[i] ?? null,
            rain_mm: precip[i] ?? null,
            wind_speed: wind[i] ?? null,
            weather_code: code[i] ?? null,
            granularity: 'hourly',
        }));

        const result = await prisma.weather.createMany({ data: records, skipDuplicates: true });
        console.log(`✅ Saved ${result.count} records for ${loc.name}`);
    } catch (err) {
        console.error(`❌ Error fetching weather for ${loc.name}:`, err);
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
            // random interval 1-3 ชั่วโมง
            const randomHour = Math.floor(Math.random() * 3) + 1;

            // cron แบบนาที: ทุก randomHour ชั่วโมง
            const cronExpr = `*/${randomHour * 60} * * * *`;
            console.log(`📅 Schedule for ${loc.name}: ${cronExpr}`);

            cron.schedule(cronExpr, async () => {
                console.log(`🕒 Running scheduled job for ${loc.name} at ${new Date().toISOString()}`);
                try {
                    await fetchAndSaveWeatherForLocation(loc.id);
                } catch (err) {
                    console.error(`❌ Cron job error for ${loc.name}:`, err);
                }
            });
        });
    });
}
