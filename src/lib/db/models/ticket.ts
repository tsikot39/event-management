import { Schema, model, models } from 'mongoose';

export interface ITicket {
  _id: string;
  eventId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrCode?: string;
  status: 'active' | 'used' | 'refunded';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  confirmationCode: string;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    qrCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'used', 'refunded'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    confirmationCode: {
      type: String,
      required: true,
      unique: true,
      default: () => {
        // Generate a unique confirmation code
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
      },
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
ticketSchema.index({ eventId: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ purchaseDate: 1 });

export const Ticket = models.Ticket || model<ITicket>('Ticket', ticketSchema);
