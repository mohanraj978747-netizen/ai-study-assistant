import express from 'express';
import { getNotes, uploadNote, getNoteById, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotes);
router.post('/upload', upload.single('note'), uploadNote);
router.get('/:id', getNoteById);
router.delete('/:id', deleteNote);

export default router;
