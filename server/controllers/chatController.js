import ChatHistory from '../models/ChatHistory.model.js';
import { askTutor } from '../utils/aiServiceClient.js';


// ============================================================
// GET ALL CONVERSATIONS
// ============================================================

export async function getConversations(req, res, next) {
  try {
    const conversations = await ChatHistory.find({
      user: req.user._id,
    })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}


// ============================================================
// CREATE NEW CONVERSATION
// ============================================================

export async function createConversation(req, res, next) {
  try {
    const { title } = req.body;

    const conversation = await ChatHistory.create({
      user: req.user._id,
      title: title?.slice(0, 60) || 'New chat',
      messages: [],
    });

    res.status(201).json({
      conversation,
    });
  } catch (err) {
    next(err);
  }
}


// ============================================================
// GET MESSAGES
// ============================================================

export async function getMessages(req, res, next) {
  try {
    const conversation = await ChatHistory.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    res.json({
      messages: conversation.messages,
    });
  } catch (err) {
    next(err);
  }
}


// ============================================================
// SEND MESSAGE
// ============================================================

export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;

    // --------------------------------------------------------
    // Validate message
    // --------------------------------------------------------

    if (!content?.trim()) {
      res.status(400);
      throw new Error('Message content is required');
    }


    // --------------------------------------------------------
    // Find conversation
    // --------------------------------------------------------

    const conversation = await ChatHistory.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }


    // --------------------------------------------------------
    // Save user's message
    // --------------------------------------------------------

    conversation.messages.push({
      role: 'user',
      content: content.trim(),
    });


    // --------------------------------------------------------
    // Automatically create conversation title
    // --------------------------------------------------------

    if (
      conversation.title === 'New chat' &&
      conversation.messages.filter(
        (message) => message.role === 'user'
      ).length === 1
    ) {
      conversation.title = content.trim().slice(0, 60);
    }


    // --------------------------------------------------------
    // Prepare history for Nova
    // --------------------------------------------------------

    const history = conversation.messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));


    // --------------------------------------------------------
    // Ask Nova
    // --------------------------------------------------------

    let tutorResponse;

    try {
      tutorResponse = await askTutor(
        content,
        history
      );
    } catch (err) {
      console.error('AI tutor call failed:', err.message);

      // Save user's message even if AI fails
      await conversation.save();

      res.status(502);

      throw new Error(
        'Your tutor could not respond right now. Please try again.'
      );
    }


    // --------------------------------------------------------
    // Save Nova response + web sources
    // --------------------------------------------------------

    conversation.messages.push({
      role: 'assistant',
      content: tutorResponse.reply,
      sources: tutorResponse.sources || [],
    });


    // --------------------------------------------------------
    // Save conversation to MongoDB
    // --------------------------------------------------------

    await conversation.save();


    // --------------------------------------------------------
    // Get saved assistant message
    // --------------------------------------------------------

    const savedReply =
      conversation.messages[
        conversation.messages.length - 1
      ];


    // --------------------------------------------------------
    // Return response to React frontend
    // --------------------------------------------------------

    res.json({
      message: savedReply,
    });

  } catch (err) {
    next(err);
  }
}


// ============================================================
// DELETE CONVERSATION
// ============================================================

export async function deleteConversation(req, res, next) {
  try {
    const conversation =
      await ChatHistory.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    res.json({
      message: 'Conversation deleted',
    });

  } catch (err) {
    next(err);
  }
}
