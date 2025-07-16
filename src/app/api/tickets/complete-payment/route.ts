import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { Ticket } from "@/lib/db/models";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find the ticket and verify ownership
    const ticket = await Ticket.findOne({
      _id: ticketId,
      userId: session.user.id,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.paymentStatus === "completed") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
    }

    // Update payment status to completed
    ticket.paymentStatus = "completed";
    await ticket.save();

    return NextResponse.json({ 
      message: "Payment completed successfully",
      ticket: {
        id: ticket._id,
        paymentStatus: ticket.paymentStatus
      }
    });

  } catch (error) {
    console.error("Payment completion error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
