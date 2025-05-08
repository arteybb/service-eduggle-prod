import * as mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  users: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      isRead: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export { NotificationSchema };
