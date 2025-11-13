import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class IngestJobController {
  static async create(req: Request, res: Response) {
    try {
      const { note, source, status } = req.body;

      if (!note) {
        return res.status(400).json({ error: "Missing note" });
      }

      const job = await prisma.ingestJob.create({
        data: {
          status: status?.toString() ?? undefined,
          note,
          source: source || "unknown",
        },
      });

      return res.status(201).json({ success: true, data: job });
    } catch (error: any) {
      console.error("Error saving ingest job:", error);
      return res.status(500).json({ error: "Failed to save ingest job" });
    }
  }
}

