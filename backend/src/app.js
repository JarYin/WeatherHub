// src/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// src/middleware/errorHandler.ts
var errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...process.env.NODE_ENV === "development" && { stack: err.stack }
    }
  });
};

// src/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`
    }
  });
};

// src/routes/index.ts
import { Router as Router6 } from "express";

// src/routes/weatherRoutes.ts
import { Router } from "express";

// src/controllers/weather/weatherController.ts
import { PrismaClient } from "@prisma/client";
import { fetchWeatherApi } from "openmeteo";
import { Parser } from "json2csv";
import fetch from "node-fetch";

// src/lib/ip.ts
function getUserIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return ip || req.socket.remoteAddress || "127.0.0.1";
}

// src/controllers/weather/weatherController.ts
import { RateLimiterMemory } from "rate-limiter-flexible";
import NodeCache from "node-cache";
var prisma = new PrismaClient();
var rateLimiter = new RateLimiterMemory({
  points: 25,
  duration: 60
});
var cache = new NodeCache({ stdTTL: 3600 });
var WeatherController = class {
  async getLatest(req, res) {
    const { location_id } = req.query;
    if (!location_id) return res.status(400).json({ message: "location_id is required" });
    const cacheKey = `latest_${location_id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log("Served getLatest from cache:", cacheKey);
      return res.json(cached);
    }
    const userIP = getUserIP(req);
    await rateLimiter.consume(userIP, 1);
    const startOfHour = /* @__PURE__ */ new Date();
    startOfHour.setMinutes(0, 0, 0);
    const startOfNextHour = new Date(startOfHour);
    startOfNextHour.setHours(startOfHour.getHours() + 1);
    let latest = await prisma.weather.findFirst({
      where: {
        location_id: String(location_id),
        timestamp: { gte: startOfHour, lt: startOfNextHour }
      },
      orderBy: { timestamp: "desc" }
    });
    if (!latest) {
      const location = await prisma.location.findUnique({
        where: { id: String(location_id) }
      });
      if (location) {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            const current = data.current;
            if (current) {
              const record = {
                location_id: String(location.id),
                timestamp: new Date(current.time),
                temperature: Number(current.temperature_2m ?? 0),
                humidity: Number(current.relative_humidity_2m ?? 0),
                rain_mm: Number(current.precipitation ?? 0),
                wind_speed: Number(current.wind_speed_10m ?? 0),
                weather_code: Number(current.weather_code ?? 0),
                granularity: "hourly"
              };
              latest = await prisma.weather.upsert({
                where: {
                  location_id_timestamp_granularity: {
                    location_id: record.location_id,
                    timestamp: record.timestamp,
                    granularity: record.granularity
                  }
                },
                update: record,
                create: record
              });
            }
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      }
    }
    if (!latest) return res.status(404).json({ message: "No weather data found for the current hour" });
    cache.set(cacheKey, latest, 60);
    console.log("Cached new result:", cacheKey);
    return res.json(latest);
  }
  async getHourly(req, res) {
    const { location_id, from, to } = req.query;
    if (!location_id || !from || !to)
      return res.status(400).json({ message: "location_id, from, to required" });
    const cacheKey = `hourly_${location_id}_${from}_${to}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log("Served getHourly from cache:", cacheKey);
      return res.json(cached);
    }
    const data = await prisma.weather.findMany({
      where: {
        location_id: String(location_id),
        timestamp: { gte: new Date(from), lte: new Date(to) },
        granularity: "hourly"
      },
      orderBy: { timestamp: "asc" }
    });
    cache.set(cacheKey, data, 3600);
    console.log("Cached new result:", cacheKey);
    return res.json(data);
  }
  async getDaily(req, res) {
    const { location_id, from, to } = req.query;
    if (!location_id || !from || !to)
      return res.status(400).json({ message: "location_id, from, to required" });
    const cacheKey = `daily_${location_id}_${from}_${to}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log("Served getDaily from cache:", cacheKey);
      return res.json(cached);
    }
    const data = await prisma.dailySummary.findMany({
      where: {
        locationId: String(location_id),
        date: { gte: new Date(from), lte: new Date(to) }
      },
      include: {
        location: true
      },
      orderBy: { date: "asc" }
    });
    cache.set(cacheKey, data, 3600);
    console.log("Cached new result:", cacheKey);
    return res.json(data);
  }
  async exportCSV(req, res) {
    const { location_id, from, to, type } = req.query;
    if (!location_id || !from || !to)
      return res.status(400).json({ message: "location_id, from, to required" });
    const data = await prisma.weather.findMany({
      where: {
        location_id: String(location_id),
        timestamp: { gte: new Date(from), lte: new Date(to) },
        granularity: type === "daily" ? "daily" : "hourly"
      },
      orderBy: { timestamp: "asc" }
    });
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header("Content-Type", "text/csv");
    res.attachment(`weather_${location_id}_${type || "hourly"}.csv`);
    res.send(csv);
  }
  // ดึงข้อมูลจาก open-meteo และบันทึกลงฐานข้อมูล
  async fetchAndSaveWeather(req, res) {
    const locations = await prisma.location.findMany();
    for (const loc of locations) {
      const weatherResponse = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
        latitude: loc.lat,
        longitude: loc.lon,
        hourly: ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "weathercode"],
        daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "weathercode"],
        timezone: "auto"
      });
      const w = weatherResponse[0];
      if (!w) {
        console.warn(`No weather data returned for location ${loc.id}, skipping.`);
        continue;
      }
      const hourly = w.hourly();
      if (!hourly) {
        console.warn(`No hourly data for location ${loc.id}, skipping.`);
        continue;
      }
      const varTemp = hourly.variables(0);
      const varHumidity = hourly.variables(1);
      const varPrecip = hourly.variables(2);
      const varWind = hourly.variables(3);
      const varCode = hourly.variables(4);
      if (!varTemp || !varHumidity || !varPrecip || !varWind || !varCode) {
        console.warn(`Missing hourly variables for location ${loc.id}, skipping.`);
        continue;
      }
      const times = hourly.time();
      const temp = varTemp.valuesArray();
      const humidity = varHumidity.valuesArray();
      const precip = varPrecip.valuesArray();
      const wind = varWind.valuesArray();
      const code = varCode.valuesArray();
      if (!times || !temp || !humidity || !precip || !wind || !code) {
        console.warn(`Incomplete hourly data arrays for location ${loc.id}, skipping.`);
        continue;
      }
      const records = times.map((t, i) => ({
        location_id: loc.id,
        timestamp: new Date(t),
        temperature: Number(temp[i] ?? 0),
        humidity: Number(humidity[i] ?? 0),
        rain_mm: Number(precip[i] ?? 0),
        wind_speed: Number(wind[i] ?? 0),
        weather_code: Number(code[i] ?? 0),
        granularity: "hourly"
      }));
      if (records.length > 0) {
        await prisma.weather.createMany({ data: records, skipDuplicates: true });
      }
    }
    res.json({ message: "Weather data fetched and saved." });
  }
  async insertWeatherByLocation(location) {
    const now = /* @__PURE__ */ new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
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
    const records = times.map((t, i) => ({
      location_id: String(location.id),
      timestamp: new Date(t),
      temperature: Number(temp?.[i] ?? 0),
      humidity: Number(humidity?.[i] ?? 0),
      rain_mm: Number(precip?.[i] ?? 0),
      wind_speed: Number(wind?.[i] ?? 0),
      weather_code: Number(code?.[i] ?? 0),
      granularity: "hourly"
    })).filter((record) => record.timestamp >= todayStart && record.timestamp <= now);
    if (records.length > 0) {
      await prisma.weather.createMany({ data: records, skipDuplicates: true });
    }
    return { hourly: records };
  }
  async fetchWeatherNowByLocation(req, res) {
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
        granularity: "hourly"
      };
      const result = await prisma.weather.upsert({
        where: {
          location_id_timestamp_granularity: {
            location_id: record.location_id,
            timestamp: record.timestamp,
            granularity: record.granularity
          }
        },
        update: record,
        create: record
      });
      if (!result) {
        throw new Error("Failed to upsert weather record");
      }
      return res.status(200).json({
        message: "Weather data updated",
        current: record
      });
    } catch (err) {
      console.error("fetchWeatherNowByLocation error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
};

// src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
var authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// src/routes/weatherRoutes.ts
var router = Router();
var controller = new WeatherController();
router.use(authMiddleware);
router.get("/latest", controller.getLatest.bind(controller));
router.get("/hourly", controller.getHourly.bind(controller));
router.get("/daily", controller.getDaily.bind(controller));
router.get("/export/csv", controller.exportCSV.bind(controller));
router.post("/ingest/run", controller.fetchWeatherNowByLocation.bind(controller));
router.post("/fetch", controller.fetchAndSaveWeather.bind(controller));
var weatherRoutes_default = router;

// src/routes/auth.ts
import { Router as Router2 } from "express";

// src/utils/app-error.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/controllers/auth/authController.ts
import bcrypt from "bcryptjs";

// src/lib/prisma.ts
import { PrismaClient as PrismaClient2 } from "@prisma/client";
var prisma2 = new PrismaClient2();
var prisma_default = prisma2;

// src/controllers/auth/authController.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET;
var JWT_EXPIRES_IN = "7d";
var AuthController = class {
  async signup(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError("Email and password are required", 400);
      const existingUser = await prisma_default.user.findUnique({ where: { email } });
      if (existingUser) throw new AppError("User already exists", 409);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma_default.user.create({
        data: { email, password: hashedPassword }
      });
      delete newUser.password;
      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      next(err);
    }
  }
  async signin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError("Email and password are required", 400);
      const user = await prisma_default.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return res.status(400).json({ success: false, error: { message: "Invalid email or password" } });
      }
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ success: false, error: { message: "Invalid email or password" } });
      }
      const { password: _pwd, ...userWithoutPassword } = user;
      const token = jwt2.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie("session", token, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        sameSite: "none",
        path: "/"
      });
      return res.json({ success: true, data: userWithoutPassword });
    } catch (err) {
      next(err);
    }
  }
  async signout(req, res, next) {
    try {
      res.clearCookie("session", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0,
        path: "/"
      });
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
  async getMe(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      }
      const user = await prisma_default.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, error: { message: "User not found" } });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json({ success: true, data: userWithoutPassword });
    } catch (err) {
      next(err);
    }
  }
};

// src/routes/auth.ts
var router2 = Router2();
var authController = new AuthController();
router2.get("/", (req, res) => {
  res.json({
    message: "Auth endpoints",
    endpoints: {
      signUp: "/api/auth/sign-up (POST)",
      login: "/api/auth/login (POST)",
      logout: "/api/auth/logout (POST)",
      me: "/api/auth/me (GET) - requires auth"
    }
  });
});
router2.post("/sign-up", authController.signup);
router2.post("/login", authController.signin);
router2.post("/logout", authController.signout);
router2.get("/me", authMiddleware, authController.getMe);
var auth_default = router2;

// src/routes/location.ts
import { Router as Router3 } from "express";

// src/controllers/location/locationController.ts
import { PrismaClient as PrismaClient4 } from "@prisma/client";

// src/scheduler/weather.scheduler.ts
import cron from "node-cron";
import { PrismaClient as PrismaClient3 } from "@prisma/client";
import { fetchWeatherApi as fetchWeatherApi2 } from "openmeteo";

// src/lib/timezone.ts
function localTimeISO(date = /* @__PURE__ */ new Date()) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const mins = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${hours}:${mins}`;
}

// src/scheduler/weather.scheduler.ts
var prisma3 = new PrismaClient3();
async function summaryWeather(locationId, date) {
  try {
    if (!locationId || !date)
      throw new Error("locationId and date are required");
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const response = await prisma3.weather.findMany({
      where: {
        location_id: String(locationId),
        timestamp: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1e3)
        },
        granularity: "hourly"
      },
      orderBy: { timestamp: "asc" }
    });
    if (response.length === 0) {
      throw new Error("No weather data found for the specified date");
    }
    const temperatures = response.map((r) => r.temperature).filter((t) => t !== null);
    const winds = response.map((r) => r.wind_speed).filter((w) => w !== null);
    const rainfalls = response.map((r) => r.rain_mm).filter((rf) => rf !== null);
    const summary = {
      date: targetDate.toISOString().split("T")[0],
      temperature: {
        min: Math.min(...temperatures),
        max: Math.max(...temperatures)
      },
      rainfall: {
        total: rainfalls.reduce((a, b) => a + b, 0)
      },
      wind_max: Math.max(...winds)
    };
    const summarySubmit = await prisma3.dailySummary.upsert({
      where: {
        locationId_date: {
          locationId: String(locationId),
          date: targetDate
        }
      },
      update: {
        temp_min: summary.temperature.min,
        temp_max: summary.temperature.max,
        rain_total: summary.rainfall.total,
        wind_max: summary.wind_max
      },
      create: {
        locationId: String(locationId),
        date: targetDate,
        temp_min: summary.temperature.min,
        temp_max: summary.temperature.max,
        rain_total: summary.rainfall.total,
        wind_max: summary.wind_max
      }
    });
    console.log(`Daily summary saved for location ${locationId} on ${summary.date}`);
  } catch (err) {
    console.error(`Error summarizing weather for location ${locationId} on ${date}:`, err);
  }
}
function startSummaryWeatherScheduler() {
  console.log("Weather Summary Scheduler started...");
  prisma3.location.findMany({ where: { isActive: true } }).then((locations) => {
    locations.forEach((loc) => {
      const cronExpr = `5 23 * * *`;
      console.log(`Summary Schedule for ${loc.name}: ${cronExpr}`);
      cron.schedule(cronExpr, async () => {
        console.log(`Running daily summary job for ${loc.name} at ${localTimeISO()}`);
        try {
          await summaryWeather(loc.id, localTimeISO());
        } catch (err) {
          console.error(`Daily summary job error for ${loc.name}:`, err);
        }
      });
      summaryWeather(loc.id, localTimeISO()).catch((err) => {
        console.error(`Initial daily summary error for ${loc.name}:`, err);
      });
    });
  });
}

// src/controllers/location/locationController.ts
var prisma4 = new PrismaClient4();
var controller2 = new WeatherController();
var LocationController = class {
  static async getAllLocations(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;
      const [locations, total] = await Promise.all([
        prisma4.location.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" }
        }),
        prisma4.location.count({
          where: { userId }
        })
      ]);
      res.json({
        success: true,
        data: locations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  }
  static async createLocation(req, res) {
    try {
      const { name, lat, lon, timezone } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const uniqueKey = { userId, name };
      const count = await prisma4.location.count({ where: { userId } });
      if (count >= 10) {
        return res.status(400).json({ error: "can't create more than 10 locations" });
      }
      const newLocation = await prisma4.location.upsert({
        where: {
          userId_name: uniqueKey
        },
        update: {
          lat,
          lon,
          timezone
        },
        create: {
          name,
          lat,
          lon,
          timezone,
          userId
        }
      });
      if (!newLocation) {
        return res.status(500).json({ error: "Failed to create or update location" });
      }
      await controller2.insertWeatherByLocation(newLocation);
      await startSummaryWeatherScheduler();
      res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
      console.error("Error creating/updating location:", error);
      res.status(500).json({ error: "Failed to process location request" });
    }
  }
  static async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const location = await prisma4.location.findUnique({
        where: { id }
      });
      if (!location || location.userId !== userId) {
        return res.status(404).json({ error: "Location not found" });
      }
      await prisma4.$transaction([
        prisma4.weather.deleteMany({
          where: { location_id: id }
        }),
        prisma4.location.delete({
          where: { id }
        })
      ]);
      res.json({ success: true, message: "Location deleted" });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  }
  static async setDefaultLocation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      await prisma4.location.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
      const updatedLocation = await prisma4.location.update({
        where: { id },
        data: { isDefault: true }
      });
      res.json({ success: true, data: updatedLocation });
    } catch (error) {
      console.error("Error setting default location:", error);
      res.status(500).json({ error: "Failed to set default location" });
    }
  }
  static async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { name, lat, lon, timezone, isDefault } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const location = await prisma4.location.findUnique({
        where: { id }
      });
      if (!location || location.userId !== userId) {
        return res.status(404).json({ error: "Location not found" });
      }
      const updatedLocation = await prisma4.location.update({
        where: { id },
        data: { name, lat, lon, timezone, isDefault }
      });
      res.json({ success: true, data: updatedLocation });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  }
};

// src/routes/location.ts
var router3 = Router3();
router3.use(authMiddleware);
router3.get("/doc", (req, res) => {
  res.json({
    message: "Location endpoints",
    endpoints: {
      getAllLocations: "/api/locations/ (GET)",
      createLocation: "/api/locations/ (POST)"
    }
  });
});
router3.get("/", LocationController.getAllLocations);
router3.post("/", LocationController.createLocation);
router3.delete("/:id", LocationController.deleteLocation);
router3.put("/:id/default", LocationController.setDefaultLocation);
router3.put("/:id", LocationController.updateLocation);
var location_default = router3;

// src/controllers/compare/compareController.ts
import { PrismaClient as PrismaClient5 } from "@prisma/client";
var prisma5 = new PrismaClient5();
var CompareController = class {
  static async compareLocations(req, res) {
    const COMPARE_LIMIT = 2;
    try {
      const { locationId } = req.body;
      const userId = req.user?.id;
      console.log("Comparing location:", locationId, "for user:", userId);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!locationId) {
        return res.status(400).json({ message: "Location ID is required" });
      }
      const locations = await prisma5.location.findMany({
        where: {
          id: locationId
        }
      });
      if (locations.length === 0) {
        return res.status(404).json({ message: "No locations found for comparison" });
      }
      const existCompare = await prisma5.compares.findFirst({
        where: {
          UserId: userId,
          locationId
        }
      });
      if (existCompare) {
        return res.status(400).json({ message: "Comparison record already exists" });
      }
      const existCompareLimit = await prisma5.compares.count({
        where: {
          UserId: userId
        }
      });
      if (existCompareLimit >= COMPARE_LIMIT) {
        return res.status(400).json({ message: `Comparison limit of ${COMPARE_LIMIT} locations reached` });
      }
      const comparedData = await prisma5.compares.create({
        data: {
          UserId: userId,
          locationId
        },
        include: {
          location: true
        }
      });
      if (!comparedData) {
        return res.status(500).json({ message: "Failed to create comparison record" });
      }
      return res.status(200).json({ message: "Comparison successful", data: comparedData });
    } catch (error) {
      console.error("Error comparing locations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getComparedLocations(req, res) {
    try {
      const userId = req.user?.id;
      const startOfHour = /* @__PURE__ */ new Date();
      startOfHour.setMinutes(0, 0, 0);
      const startOfNextHour = new Date(startOfHour);
      startOfNextHour.setHours(startOfHour.getHours() + 1);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const comparedLocations = await prisma5.compares.findMany({
        where: {
          UserId: userId
        },
        include: {
          location: true
        }
      });
      if (!comparedLocations) {
        return res.status(404).json({ message: "No compared locations found" });
      }
      return res.status(200).json({ data: comparedLocations });
    } catch (error) {
      console.error("Error fetching compared locations:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async deleteComparedLocation(req, res) {
    try {
      const userId = req.user?.id;
      const { locationId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const deletedCompare = await prisma5.compares.deleteMany({
        where: {
          UserId: userId,
          locationId
        }
      });
      if (deletedCompare.count === 0) {
        return res.status(404).json({ message: "No comparison record found to delete" });
      }
      return res.status(200).json({ message: "Comparison record deleted successfully" });
    } catch (error) {
      console.error("Error deleting compared location:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

// src/routes/compare.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.use(authMiddleware);
router4.post("/", (req, res) => {
  CompareController.compareLocations(req, res);
});
router4.get("/", (req, res) => {
  CompareController.getComparedLocations(req, res);
});
router4.delete("/:locationId", (req, res) => {
  CompareController.deleteComparedLocation(req, res);
});
var compare_default = router4;

// src/routes/ingestJob.ts
import { Router as Router5 } from "express";

// src/controllers/ingestJob/ingestJobController.ts
import { PrismaClient as PrismaClient6 } from "@prisma/client";
var prisma6 = new PrismaClient6();
var IngestJobController = class {
  static async create(req, res) {
    try {
      const { note, source, status } = req.body;
      if (!note) {
        return res.status(400).json({ error: "Missing note" });
      }
      const job = await prisma6.ingestJob.create({
        data: {
          status: status?.toString() ?? void 0,
          note,
          source: source || "unknown"
        }
      });
      return res.status(201).json({ success: true, data: job });
    } catch (error) {
      console.error("Error saving ingest job:", error);
      return res.status(500).json({ error: "Failed to save ingest job" });
    }
  }
};

// src/routes/ingestJob.ts
var router5 = Router5();
router5.post("/", IngestJobController.create);
var ingestJob_default = router5;

// src/routes/index.ts
var router6 = Router6();
router6.use("/weather", weatherRoutes_default);
router6.use("/auth", auth_default);
router6.use("/locations", location_default);
router6.use("/compare", compare_default);
router6.use("/ingest-job", ingestJob_default);
router6.get("/", (req, res) => {
  res.json({
    message: "WeatherHub API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      location: "/api/locations",
      weather: "/api/weather",
      compare: "/api/compare"
    }
  });
});
var routes_default = router6;

// src/app.ts
var app = express();
app.use(helmet());
var allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin !== allowedOrigin) {
    console.warn(`Blocked request from origin: ${origin}`);
    return res.status(403).json({ error: "Forbidden: Invalid Origin" });
  }
  next();
});
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  });
});
app.use("/api", routes_default);
app.use(notFound);
app.use(errorHandler);
var app_default = app;
export {
  app_default as default
};
