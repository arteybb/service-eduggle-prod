import * as mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  mediaPath: { type: String }, // เก็บพาธไฟล์วิดีโอหรือเอกสาร
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
});

export default LessonSchema;
