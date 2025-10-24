import type { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { WeatherController } from 'controllers/weather/weatherController';

const prisma = new PrismaClient();
const controller = new WeatherController();

export class LocationController {
  static async getAllLocations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const locations = await prisma.location.findMany({
        where: { userId },
      });
      res.json({ success: true, data: locations });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  }

  static async createLocation(req: Request, res: Response) {
    try {
      const { name, lat, lon, timezone } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const uniqueKey = { userId, name };
      const newLocation = await prisma.location.upsert({
        where: {
          userId_name: uniqueKey,
        },
        update: {
          lat: lat,
          lon: lon,
          timezone: timezone,
        },
        create: {
          name,
          lat,
          lon,
          timezone,
          userId,
        },
      });

      if(!newLocation) {
        return res.status(500).json({ error: "Failed to create or update location" });
      }

      await controller.insertWeatherByLocation(newLocation);
      
      res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
      console.error("Error creating/updating location:", error);
      res.status(500).json({ error: "Failed to process location request" });
    }
  }

  static async deleteLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const location = await prisma.location.findUnique({
        where: { id },
      });
      if (!location || location.userId !== userId) {
        return res.status(404).json({ error: "Location not found" });
      }

      await prisma.$transaction([
        prisma.weather.deleteMany({
          where: { location_id: id },
        }),
        prisma.location.delete({
          where: { id },
        }),
      ]);

      res.json({ success: true, message: "Location deleted" });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ error: "Failed to delete location" });
    }
  }

  static async setDefaultLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await prisma.location.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      const updatedLocation = await prisma.location.update({
        where: { id },
        data: { isDefault: true },
      });

      res.json({ success: true, data: updatedLocation });
    } catch (error) {
      console.error("Error setting default location:", error);
      res.status(500).json({ error: "Failed to set default location" });
    }
  }

  static async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, lat, lon, timezone, isDefault } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const location = await prisma.location.findUnique({
        where: { id },
      });

      if (!location || location.userId !== userId) {
        return res.status(404).json({ error: "Location not found" });
      }

      const updatedLocation = await prisma.location.update({
        where: { id },
        data: { name, lat, lon, timezone, isDefault },
      });

      res.json({ success: true, data: updatedLocation });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  }
}