import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../modules/auth/auth.types';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = model<IUser>('User', userSchema);
export default UserModel;
