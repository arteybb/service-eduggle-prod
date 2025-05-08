import * as mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{ type: Number, required: true }],
  timeSpent: { type: Number, default: 0 },
  score: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

QuizAttemptSchema.index({ quizId: 1, userId: 1 });

export default QuizAttemptSchema;
