import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { Ticket } from "@/lib/db/models";

export async function GET() {
  try {
    console.log("Debug tickets API called");
    
    const session = await auth();
    console.log("Session:", session?.user?.id);
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated", session: null }, { status: 401 });
    }

    await connectToDatabase();
    console.log("Connected to database");

    // First, get tickets without populate to see what we have
    const rawTickets = await Ticket.find({ userId: session.user.id });
    console.log("Raw tickets found:", rawTickets.length);
    console.log("Raw tickets:", JSON.stringify(rawTickets, null, 2));

    // Now try with populate
    const populatedTickets = await Ticket.find({ userId: session.user.id })
      .populate({
        path: "eventId",
        select: "title startDate endDate startTime endTime location venue isVirtual slug organizerId",
        populate: {
          path: "organizerId",
          select: "name companyName",
        },
      })
      .sort({ purchaseDate: -1 });

    console.log("Populated tickets found:", populatedTickets.length);
    console.log("Populated tickets:", JSON.stringify(populatedTickets, null, 2));

    return NextResponse.json({
      session: session.user,
      rawTickets: rawTickets.length,
      populatedTickets: populatedTickets.length,
      data: populatedTickets
    });

  } catch (error) {
    console.error("Debug tickets error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
