import express from 'express';

import templateController from '../controllers/templateController.js';

const router = express.Router();

router.post('/list', templateController.findTemplateList);
router.post('/upsert', templateController.upsertTemplate);
router.delete('/delete/:id', templateController.deleteTempleteByID);
router.get('/get/:id', templateController.getTemplateByID);
router.get('/count', templateController.getNumberOfTemplates);

export default router;
