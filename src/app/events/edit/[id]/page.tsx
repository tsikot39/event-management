import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { Event, Category } from "@/lib/db/models";
import { Navbar } from "@/components/layout/navbar";
import EditEventForm from "@/components/events/EditEventForm";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Event | Event Management",
  description: "Edit your event details",
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  await connectToDatabase();

  // Find the event and verify ownership
  const event = await Event.findById(id)
    .populate("organizerId", "name email")
    .populate("categoryId", "name description");

  if (!event) {
    notFound();
  }

  // Check if the user owns this event
  if (event.organizerId._id.toString() !== session.user.id) {
    redirect("/dashboard");
  }

  // Get all categories for the form
  const categories = await Category.find({ status: "active" }).sort({ name: 1 });

  // Convert to plain objects for client components
  const serializedEvent = JSON.parse(JSON.stringify(event));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600 mt-2">
              Update your event details and settings
            </p>
          </div>

          <EditEventForm event={serializedEvent} categories={serializedCategories} />
        </div>
      </div>
    </div>
  );
}
