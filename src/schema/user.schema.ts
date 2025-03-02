import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: String,
  uid: String,
  email: String,
  displayName: String,
  photoImg: String,
  photoURL: String,
  role: String,
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default UserSchema;
