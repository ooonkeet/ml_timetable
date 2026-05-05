// src/routes/section.routes.js
import express from 'express';
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} from '../../controllers/admin/section.controller.js';

const router = express.Router();

router.post('/createSection', createSection);
router.get('/getSection', getSections);
router.get('/:id', getSectionById);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;
