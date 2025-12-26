import { Router } from "express";
import { IngestJobController } from '../controllers/ingestJob/ingestJobController.js';

const router = Router();

router.post("/", IngestJobController.create);

export default router;
