import * as mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationLogin: { type: Number, required: true, min: 1, max: 5 },
  courseManagement: { type: Number, required: true, min: 1, max: 5 },
  deviceCompatibility: { type: Number, required: true, min: 1, max: 5 },
  performanceTracking: { type: Number, required: true, min: 1, max: 5 },
  performanceNotification: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default FeedbackSchema;
