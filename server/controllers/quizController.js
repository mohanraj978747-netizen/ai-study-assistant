import Quiz from '../models/Quiz.model.js';
import Note from '../models/Note.model.js';
import { generateQuizQuestions } from '../utils/aiServiceClient.js';

export async function getQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    next(err);
  }
}

export async function generateQuiz(req, res, next) {
  try {
    const { topic, noteId, difficulty = 'medium', numQuestions = 5 } = req.body;

    let noteText;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      noteText = note?.content;
    }

    if (!topic && !noteText) {
      res.status(400);
      throw new Error('Provide a topic or select a note to generate a quiz from');
    }

    let questions;
    try {
      questions = await generateQuizQuestions({ topic, noteText, difficulty, numQuestions });
    } catch (err) {
      console.error('AI quiz generation failed:', err.message);
      res.status(502);
      throw new Error('The AI tutor could not generate questions right now. Please try again.');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(502);
      throw new Error('The AI tutor could not generate questions right now. Please try again.');
    }

    const quiz = await Quiz.create({
      user: req.user._id,
      topic: topic || 'General knowledge',
      difficulty,
      note: noteId || undefined,
      questions,
    });

    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function submitQuizAttempt(req, res, next) {
  try {
    const { answers = [] } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    let score = 0;
    for (const { questionId, selectedIndex } of answers) {
      const question = quiz.questions.id(questionId);
      if (question && question.correctIndex === selectedIndex) score += 1;
    }

    quiz.score = score;
    quiz.total = quiz.questions.length;
    await quiz.save();

    res.json({ result: { score, total: quiz.total } });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
}
