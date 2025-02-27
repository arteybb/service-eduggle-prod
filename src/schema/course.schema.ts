import * as mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ชื่อของ Course
  description: { type: String }, // รายละเอียดของ Course
  imageName: { type: String }, // ชื่อไฟล์ของรูปภาพ
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Array ของ lessons ที่เชื่อมกับ Course
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], // Array ของ quizzes ที่เชื่อมกับ Course
});

export default CourseSchema;
