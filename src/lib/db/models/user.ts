import { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'organizer' | 'attendee';
  profilePicture?: string;
  companyName?: string; // For organizers
  contactDetails?: string; // For organizers
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['organizer', 'attendee'],
      required: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    contactDetails: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
userSchema.index({ role: 1 });

export const User = models.User || model<IUser>('User', userSchema);
