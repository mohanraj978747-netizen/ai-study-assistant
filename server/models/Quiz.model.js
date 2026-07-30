import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, default: 'General knowledge' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    questions: { type: [questionSchema], required: true },
    score: { type: Number },
    total: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
