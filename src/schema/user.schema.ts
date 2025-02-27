import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: String,
  uid: String,
  email: String,
  displayName: String,
  photoImg: String,
  photoURL: String,
  role: String,
});

export default UserSchema;
