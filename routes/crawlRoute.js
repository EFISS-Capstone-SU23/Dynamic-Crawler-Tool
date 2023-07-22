import express from 'express';

import crawlController from '../controllers/crawlController.js';

const router = express.Router();

router.post('/list', crawlController.findCrawlList);
router.post('/upsert', crawlController.upsertCrawl);
router.get('/:id', crawlController.findCrawlById);

export default router;
