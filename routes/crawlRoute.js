import express from 'express';

import crawlController from '../controllers/crawlController.js';

const router = express.Router();

router.post('/list', crawlController.findCrawlList);
router.post('/upsert', crawlController.upsertCrawl);

export default router;
