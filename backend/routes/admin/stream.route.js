// src/routes/stream.routes.js
import express from 'express';
import {
  createStream,
  getStreams,
  getStreamById,
  updateStream,
  deleteStream,
} from '../../controllers/admin/stream.controller.js';

const router = express.Router();

router.post('/createStream', createStream);
router.get('/getstreams', getStreams);
router.get('/:id', getStreamById);
router.put('/:id', updateStream);
router.delete('/:id', deleteStream);

export default router;
