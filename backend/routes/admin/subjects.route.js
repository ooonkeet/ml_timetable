import express from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  createSubjectsBulk,
  parseSyllabusController,
} from '../../controllers/admin/subjects.controller.js';

const router = express.Router();

router.post('/createSubject', createSubject);
router.get('/getSubjects', getSubjects);
router.get('/subject/:id', getSubjectById);
router.put('/subject/:id', updateSubject);
router.delete('/subject/:id', deleteSubject);
router.post('/createSubjectsBulk', createSubjectsBulk);
router.post('/parseSyllabus', parseSyllabusController);

export default router;
