import mongoose from 'mongoose';

// One document per study session/task, so the client can do simple
// per-task CRUD (create/update/delete a single session at a time).
const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, default: '' },
    time: { type: String, default: '' },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('StudyPlan', studyPlanSchema);
