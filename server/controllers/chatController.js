import ChatHistory from '../models/ChatHistory.model.js';
import { askTutor } from '../utils/aiServiceClient.js';

export async function getConversations(req, res, next) {
  try {
    const conversations = await ChatHistory.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const { title } = req.body;
    const conversation = await ChatHistory.create({
      user: req.user._id,
      title: title?.slice(0, 60) || 'New chat',
      messages: [],
    });
    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const conversation = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }
    res.json({ messages: conversation.messages });
  } catch (err) {
    next(err);
  }
}

// Persists the user's message, asks the tutor (via ai-service/Gemini) for a
// reply, persists that too, and returns just the reply - the client already
// has the user's message in its optimistic local state.
export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const conversation = await ChatHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    conversation.messages.push({ role: 'user', content });
    if (
      conversation.title === 'New chat' &&
      conversation.messages.filter((m) => m.role === 'user').length === 1
    ) {
      conversation.title = content.trim().slice(0,60);
    }

    const history = conversation.messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    let replyContent;
    try {
      replyContent = await askTutor(content, history);
    } catch (err) {
      console.error('AI tutor call failed:', err.message);
      await conversation.save(); // keep the user's message even if the reply failed
      res.status(502);
      throw new Error('Your tutor could not respond right now. Please try again.');
    }

    conversation.messages.push({ role: 'assistant', content: replyContent });
    await conversation.save();

    const savedReply = conversation.messages[conversation.messages.length - 1];
    res.json({ message: savedReply });
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const conversation = await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
}
