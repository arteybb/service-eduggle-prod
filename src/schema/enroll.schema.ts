import * as mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  uid: { type: String, ref: 'User', required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
});

export default EnrollmentSchema;
