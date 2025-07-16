import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import { Ticket } from "@/lib/db/models";
import { Navbar } from "@/components/layout/navbar";
import MyTicketsContent from "@/components/tickets/MyTicketsContent";

export const metadata: Metadata = {
  title: "My Tickets | Event Management",
  description: "View your purchased tickets",
};

export default async function MyTicketsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  await connectToDatabase();

  console.log("User ID from session:", session.user.id);

  const tickets = await Ticket.find({ userId: session.user.id })
    .populate({
      path: "eventId",
      select:
        "title startDate endDate startTime endTime location venue isVirtual slug organizerId",
      populate: {
        path: "organizerId",
        select: "name companyName",
      },
    })
    .sort({ purchaseDate: -1 });

  console.log("Found tickets:", tickets.length);
  if (tickets.length > 0) {
    console.log("First ticket:", JSON.stringify(tickets[0], null, 2));
  }

  // Transform the data to match component expectations
  const rawTickets = JSON.parse(JSON.stringify(tickets));
  const serializedTickets = rawTickets.map(
    (ticket: {
      eventId: { startDate: string; [key: string]: unknown };
      totalPrice: number;
    }) => ({
      ...ticket,
      event: {
        ...ticket.eventId,
        date: ticket.eventId.startDate, // Map startDate to date for component compatibility
      },
      totalAmount: ticket.totalPrice, // Map totalPrice to totalAmount for component compatibility
    })
  );

  console.log(
    "Serialized tickets sample:",
    serializedTickets.length > 0
      ? {
          date: serializedTickets[0].event.date,
          originalStartDate: rawTickets[0].eventId.startDate,
        }
      : "No tickets"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="mt-2 text-gray-600">
              View and manage your event tickets
            </p>
          </div>
          <MyTicketsContent tickets={serializedTickets} />
        </div>
      </div>
    </div>
  );
}
