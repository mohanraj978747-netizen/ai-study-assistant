import mongoose from 'mongoose';


// ============================================================
// WEB SOURCE SCHEMA
// ============================================================

const sourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Web source',
    },

    url: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);


// ============================================================
// MESSAGE SCHEMA
// ============================================================

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    sources: {
      type: [sourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// ============================================================
// CHAT HISTORY SCHEMA
// ============================================================

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: 'New chat',
    },

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model(
  'ChatHistory',
  chatHistorySchema
);