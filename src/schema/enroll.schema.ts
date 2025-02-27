import * as mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // เก็บ userId
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  }, // เก็บ courseId
  enrollmentDate: { type: Date, default: Date.now }, // วันที่ enroll
  status: { type: String, default: 'active' }, // สถานะของการ enroll
});

export default EnrollmentSchema;
