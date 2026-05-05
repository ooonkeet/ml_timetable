import express from 'express';
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from '../../controllers/admin/program.controller.js';

const router = express.Router();

router.post('/createProgram', createProgram);
router.get('/getProgram', getPrograms);
router.get('/:id', getProgramById);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

export default router;
