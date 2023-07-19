import express from 'express';

import templateController from '../controllers/templateController.js';

const router = express.Router();

router.post('/list', templateController.findTemplateList);
router.post('/insert', templateController.insertNewTemplate);

export default router;
