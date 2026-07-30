import express from 'express';
import { getQuizzes, generateQuiz, submitQuizAttempt, deleteQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getQuizzes);
router.post('/generate', generateQuiz);
router.post('/:id/submit', submitQuizAttempt);
router.delete('/:id', deleteQuiz);

export default router;
