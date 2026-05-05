import express from 'express';
import {
  createClassSettings,
  getClassSettings,
  getClassSettingsById,
  updateClassSettings,
  deleteClassSettings,
} from '../../controllers/admin/classSettings.controller.js';

const router = express.Router();

router.post('/createClass', createClassSettings);
router.get('/getClassInfo', getClassSettings);
router.get('/:id', getClassSettingsById);
router.put('/:id', updateClassSettings);
router.delete('/:id', deleteClassSettings);

export default router;
