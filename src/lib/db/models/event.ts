import { Schema, model, models } from 'mongoose';

export interface ITicketType {
  name: string;
  price: number;
  description?: string;
  quantity: number;
  sold: number;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  venue?: string;
  isVirtual: boolean;
  virtualLink?: string;
  capacity: number;
  ticketTypes: ITicketType[];
  imageUrl?: string;
  status: 'draft' | 'published' | 'cancelled';
  organizerId: Schema.Types.ObjectId;
  categoryId?: Schema.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketTypeSchema = new Schema<ITicketType>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      default: '',
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    virtualLink: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      required: true,
      validate: {
        validator: (ticketTypes: ITicketType[]) => ticketTypes.length > 0,
        message: 'At least one ticket type is required',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ location: 1 });
eventSchema.index({ tags: 1 });

export const Event = models.Event || model<IEvent>('Event', eventSchema);
