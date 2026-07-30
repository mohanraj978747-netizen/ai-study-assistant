import express from 'express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/conversations/:id', deleteConversation);

export default router;
