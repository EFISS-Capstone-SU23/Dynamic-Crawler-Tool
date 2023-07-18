import express from 'express';

import templateController from '../controllers/templateController';

const router = express.Router();

router.post('list', templateController.findTemplateList);
router.post('insert', templateController.insertNewTemplate);

export default router;
