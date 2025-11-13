import express from "express";
import { IngestJobController } from "../controllers/ingestJob/ingestJobController";

const router = express.Router();

router.post("/", IngestJobController.create);

export default router;
