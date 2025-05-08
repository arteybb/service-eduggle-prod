import * as mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  displayName: { type: String, required: true },
  userPhotoURL: { type: String },
  files: [
    {
      filename: { type: String, required: true },
      originalname: { type: String, required: true },
      fileUrl: { type: String },
    },
  ],
  comment: { type: String },
  grade: { type: Number },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  attachments: [
    {
      filename: { type: String, required: true },
      originalname: { type: String, required: true },
      fileUrl: { type: String },
    },
  ],
  dueDate: { type: Date },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  teacherPhotoURL: { type: String },
  submissions: [SubmissionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export { AssignmentSchema, SubmissionSchema };
