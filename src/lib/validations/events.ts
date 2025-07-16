import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  venue: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  maxAttendees: z.number().min(1, "Maximum attendees must be at least 1"),
  ticketPrice: z.number().min(0, "Ticket price cannot be negative"),
  isVirtual: z.boolean(),
  virtualLink: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // If not virtual, venue should be provided
    if (!data.isVirtual && (!data.venue || data.venue.length < 3)) {
      return false;
    }
    // If virtual, virtualLink should be provided
    if (data.isVirtual && (!data.virtualLink || data.virtualLink.length < 3)) {
      return false;
    }
    return true;
  },
  {
    message: "Virtual events require a virtual link, physical events require a venue",
    path: ["venue"], // This will attach the error to the venue field
  }
);

export const updateEventSchema = createEventSchema.partial();

export const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket type name is required"),
  price: z.number().min(0, "Price cannot be negative"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  description: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
