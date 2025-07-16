import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import { Event, Ticket } from "@/lib/db/models";
import { Navbar } from "@/components/layout/navbar";
import OrganizerDashboard from "@/components/organizer/OrganizerDashboard";

export const metadata: Metadata = {
  title: "Organizer Dashboard | Event Management",
  description: "Manage your events and tickets",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "organizer") {
    redirect("/");
  }

  await connectToDatabase();

  // Get organizer's events
  const events = await Event.find({ organizerId: session.user.id })
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });

  // Get ticket sales for organizer's events
  const eventIds = events.map((event) => event._id);
  const tickets = await Ticket.find({
    eventId: { $in: eventIds },
    status: { $in: ["active", "used"] },
  }).populate("eventId", "title");

  // Calculate stats
  const totalEvents = events.length;
  const totalTicketsSold = tickets.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0
  );
  const totalRevenue = tickets
    .filter((ticket) => ticket.status === "active" || ticket.status === "used")
    .reduce((sum, ticket) => sum + ticket.totalPrice, 0);

  const stats = {
    totalEvents,
    totalTicketsSold,
    totalRevenue,
    upcomingEvents: events.filter((event) => event.startDate > new Date()).length,
  };

  // Serialize for client components
  const serializedEvents = JSON.parse(JSON.stringify(events));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your events and track performance
            </p>
          </div>
          <OrganizerDashboard
            events={serializedEvents}
            stats={stats}
          />
        </div>
      </div>
    </div>
  );
}
