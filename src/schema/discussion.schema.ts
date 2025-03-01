import * as mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userPhotoURL: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const DiscussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userPhotoURL: { type: String },
  createdAt: { type: Date, default: Date.now },
  comments: [CommentSchema]
});

export { DiscussionSchema, CommentSchema }; 