import StudyPlan from '../models/StudyPlan.model.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await StudyPlan.find({ user: req.user._id }).sort({ date: 1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, subject, time, date, completed } = req.body;
    if (!title || !date) {
      res.status(400);
      throw new Error('Title and date are required');
    }
    const task = await StudyPlan.create({
      user: req.user._id,
      title,
      subject,
      time,
      date,
      completed: completed || false,
    });
    res.status(201).json({ task });
  } catch (err) {
  console.error("===== PLANNER ERROR =====");
  console.error(err);

  return res.status(500).json({
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
}
}

export async function updateTask(req, res, next) {
  try {
    const task = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
