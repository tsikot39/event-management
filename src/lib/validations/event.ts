import { z } from 'zod';

export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket type name is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.date({
    message: 'Start date is required',
  }),
  endDate: z.date({
    message: 'End date is required',
  }),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  ticketTypes: z.array(ticketTypeSchema).min(1, 'At least one ticket type is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'cancelled']).default('draft'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateEventSchema = eventSchema.partial().extend({
  id: z.string(),
});

export const purchaseTicketSchema = z.object({
  eventId: z.string(),
  ticketType: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type EventInput = z.infer<typeof eventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
