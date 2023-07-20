import express from 'express';

import templateController from '../controllers/templateController.js';

const router = express.Router();

router.post('/list', templateController.findTemplateList);
router.post('/insert', templateController.insertNewTemplate);
router.delete('/delete/:id', templateController.deleteTempleteByID);

export default router;
