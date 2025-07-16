import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { Ticket, Event, type ITicketType } from "@/lib/db/models";
import { connectToDatabase } from "@/lib/db/connection";
import { z } from "zod";

const purchaseSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(10, "Maximum 10 tickets per purchase"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = purchaseSchema.parse(body);

    await connectToDatabase();

    // Get event details
    const event = await Event.findById(validatedData.eventId);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Check if event is in the future
    if (event.startDate < new Date()) {
      return NextResponse.json(
        { message: "Cannot purchase tickets for past events" },
        { status: 400 }
      );
    }

    // Calculate available tickets across all ticket types
    const totalSold = event.ticketTypes.reduce(
      (sum: number, type: ITicketType) => sum + type.sold,
      0
    );
    const totalAvailable = event.ticketTypes.reduce(
      (sum: number, type: ITicketType) => sum + type.quantity,
      0
    );
    const availableTickets = totalAvailable - totalSold;

    if (availableTickets < validatedData.quantity) {
      return NextResponse.json(
        { message: `Only ${availableTickets} tickets available` },
        { status: 400 }
      );
    }

    // Check if user already has tickets for this event
    const existingTicket = await Ticket.findOne({
      eventId: validatedData.eventId,
      userId: session.user.id,
      status: { $in: ["active"] },
    });

    if (existingTicket) {
      return NextResponse.json(
        { message: "You already have tickets for this event" },
        { status: 400 }
      );
    }

    // Validate total amount (using the first ticket type's price for now)
    const firstTicketType = event.ticketTypes[0];
    const expectedTotal = firstTicketType.price * validatedData.quantity;
    if (Math.abs(validatedData.totalAmount - expectedTotal) > 0.01) {
      return NextResponse.json(
        { message: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = new Ticket({
      eventId: validatedData.eventId,
      userId: session.user.id,
      ticketType: firstTicketType.name,
      quantity: validatedData.quantity,
      totalPrice: validatedData.totalAmount,
      status: firstTicketType.price === 0 ? "active" : "active", // All tickets start as active
      paymentStatus: firstTicketType.price === 0 ? "completed" : "pending",
      purchaseDate: new Date(),
    });

    await ticket.save();

    // Update the sold count for the first ticket type
    await Event.findOneAndUpdate(
      { _id: validatedData.eventId, "ticketTypes.name": firstTicketType.name },
      { $inc: { "ticketTypes.$.sold": validatedData.quantity } }
    );

    return NextResponse.json(
      {
        message: "Ticket purchased successfully",
        ticket: {
          id: ticket._id,
          confirmationCode: ticket.confirmationCode,
          status: ticket.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ticket purchase error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input data", errors: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
