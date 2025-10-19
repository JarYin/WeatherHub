import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WeatherController {
    // GET /api/weather - Get all weather data for authenticated user
    static async getAllWeather(req: Request, res: Response) {
        try {
            // User info is available from JWT middleware
            const { id: userId, email } = req.user!;
            
            console.log(`User ${email} (ID: ${userId}) requesting weather data`);
            
            const weather = await prisma.weather.findMany({
                include: {
                    location: true
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 100 // Limit to latest 100 records
            });
            
            res.json({
                success: true,
                data: weather,
                requestedBy: {
                    userId,
                    email
                }
            });
        } catch (error) {
            console.error('Error fetching weather data:', error);
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
    
    // GET /api/weather/:id - Get specific weather record
    static async getWeatherById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { id: userId, email } = req.user!;
            
            const weather = await prisma.weather.findUnique({
                where: { id },
                include: {
                    location: true
                }
            });
            
            if (!weather) {
                return res.status(404).json({ error: 'Weather record not found' });
            }
            
            res.json({
                success: true,
                data: weather,
                requestedBy: { userId, email }
            });
        } catch (error) {
            console.error('Error fetching weather record:', error);
            res.status(500).json({ error: 'Failed to fetch weather record' });
        }
    }
    
    // POST /api/weather - Create new weather record
    static async createWeather(req: Request, res: Response) {
        try {
            const { locationId, timestamp, temp_c, humidity, wind_ms, rain_mm, condition } = req.body;
            const { id: userId, email } = req.user!;
            
            // Validate required fields
            if (!locationId || !timestamp || temp_c === undefined || humidity === undefined) {
                return res.status(400).json({ 
                    error: 'Missing required fields: locationId, timestamp, temp_c, humidity' 
                });
            }
            
            const weather = await prisma.weather.create({
                data: {
                    locationId,
                    timestamp: new Date(timestamp),
                    temp_c,
                    humidity,
                    wind_ms: wind_ms || 0,
                    rain_mm: rain_mm || 0,
                    condition: condition || 0,
                    ingestSource: `user_${userId}` // Track who created this record
                },
                include: {
                    location: true
                }
            });
            
            console.log(`Weather record created by user ${email} (ID: ${userId})`);
            
            res.status(201).json({
                success: true,
                data: weather,
                createdBy: { userId, email }
            });
        } catch (error: any) {
            console.error('Error creating weather record:', error);
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'Weather record already exists for this location and timestamp' });
            } else {
                res.status(500).json({ error: 'Failed to create weather record' });
            }
        }
    }
    
    // PUT /api/weather/:id - Update weather record
    static async updateWeather(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { temp_c, humidity, wind_ms, rain_mm, condition } = req.body;
            const { id: userId, email } = req.user!;
            
            // Check if record exists
            const existingWeather = await prisma.weather.findUnique({
                where: { id }
            });
            
            if (!existingWeather) {
                return res.status(404).json({ error: 'Weather record not found' });
            }
            
            const weather = await prisma.weather.update({
                where: { id },
                data: {
                    ...(temp_c !== undefined && { temp_c }),
                    ...(humidity !== undefined && { humidity }),
                    ...(wind_ms !== undefined && { wind_ms }),
                    ...(rain_mm !== undefined && { rain_mm }),
                    ...(condition !== undefined && { condition }),
                    ingestSource: `updated_by_user_${userId}` // Track who updated
                },
                include: {
                    location: true
                }
            });
            
            console.log(`Weather record ${id} updated by user ${email} (ID: ${userId})`);
            
            res.json({
                success: true,
                data: weather,
                updatedBy: { userId, email }
            });
        } catch (error) {
            console.error('Error updating weather record:', error);
            res.status(500).json({ error: 'Failed to update weather record' });
        }
    }
    
    // DELETE /api/weather/:id - Delete weather record
    static async deleteWeather(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { id: userId, email } = req.user!;
            
            // Check if record exists
            const existingWeather = await prisma.weather.findUnique({
                where: { id }
            });
            
            if (!existingWeather) {
                return res.status(404).json({ error: 'Weather record not found' });
            }
            
            await prisma.weather.delete({
                where: { id }
            });
            
            console.log(`Weather record ${id} deleted by user ${email} (ID: ${userId})`);
            
            res.json({
                success: true,
                message: 'Weather record deleted successfully',
                deletedBy: { userId, email }
            });
        } catch (error) {
            console.error('Error deleting weather record:', error);
            res.status(500).json({ error: 'Failed to delete weather record' });
        }
    }
    
    // GET /api/weather/user/stats - Get weather stats for current user
    static async getUserStats(req: Request, res: Response) {
        try {
            const { id: userId, email } = req.user!;
            
            // Count total weather records created by this user
            const totalRecords = await prisma.weather.count({
                where: {
                    ingestSource: {
                        contains: userId
                    }
                }
            });
            
            // Get latest weather records created by this user
            const latestRecords = await prisma.weather.findMany({
                where: {
                    ingestSource: {
                        contains: userId
                    }
                },
                include: {
                    location: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            });
            
            res.json({
                success: true,
                data: {
                    user: { userId, email },
                    stats: {
                        totalRecordsCreated: totalRecords,
                        latestRecords
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ error: 'Failed to fetch user stats' });
        }
    }
}