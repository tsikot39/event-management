import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata: Metadata = {
  title: "Create Event | Event Management",
  description: "Create a new event",
};

export default async function CreateEventPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "organizer") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Event
            </h1>
            <p className="mt-2 text-gray-600">
              Fill in the details below to create your event
            </p>
          </div>
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}
