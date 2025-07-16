import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import { Event } from "@/lib/db/models";
import { Navbar } from "@/components/layout/navbar";
import EventDetails from "@/components/events/EventDetails";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const event = await Event.findOne({ slug })
    .populate("organizerId", "name companyName")
    .populate("categoryId", "name");

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} | Event Management`,
    description: event.description.substring(0, 160),
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  await connectToDatabase();

  const event = await Event.findOne({ slug })
    .populate("organizerId", "name companyName profilePicture contactDetails")
    .populate("categoryId", "name description");

  if (!event) {
    notFound();
  }

  // Convert to plain object for client components
  const serializedEvent = JSON.parse(JSON.stringify(event));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EventDetails event={serializedEvent} />
    </div>
  );
}
