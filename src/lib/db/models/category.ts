import { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
categorySchema.index({ name: 1 });

export const Category = models.Category || model<ICategory>('Category', categorySchema);
