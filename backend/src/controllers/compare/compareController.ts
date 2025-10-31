import type { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import fetch from 'node-fetch';
import NodeCache from "node-cache";

const prisma = new PrismaClient();

export class CompareController {
    static async compareLocations(req: Request, res: Response) {
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

            const locations = await prisma.location.findMany({
                where: {
                    id: locationId,
                },
            });

            if (locations.length === 0) {
                return res.status(404).json({ message: "No locations found for comparison" });
            }

            const existCompare = await prisma.compares.findFirst({
                where: {
                    UserId: userId,
                    locationId: locationId,
                },
            });

            if (existCompare) {
                return res.status(400).json({ message: "Comparison record already exists" });
            }

            const existCompareLimit = await prisma.compares.count({
                where: {
                    UserId: userId,
                },
            });


            if (existCompareLimit >= COMPARE_LIMIT) {
                return res.status(400).json({ message: `Comparison limit of ${COMPARE_LIMIT} locations reached` });
            }

            const comparedData = await prisma.compares.create({
                data: {
                    UserId: userId,
                    locationId: locationId,
                },
                include: {
                    location: true,
                },
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

    static async getComparedLocations(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            const startOfHour = new Date();
            startOfHour.setMinutes(0, 0, 0);
            const startOfNextHour = new Date(startOfHour);
            startOfNextHour.setHours(startOfHour.getHours() + 1);

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const comparedLocations = await prisma.compares.findMany({
                where: {
                    UserId: userId,
                },
                include: {
                    location: true,
                },
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
    static async deleteComparedLocation(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { locationId } = req.params;

            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const deletedCompare = await prisma.compares.deleteMany({
                where: {
                    UserId: userId,
                    locationId: locationId,
                },
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
}