"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrganizerDashboardProps {
  events: Array<{
    _id: string;
    title: string;
    slug: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    location: string;
    venue?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    capacity: number;
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
      sold: number;
    }>;
    status: string;
    categoryId?: {
      name: string;
    };
  }>;
  tickets: Array<{
    _id: string;
    quantity: number;
    totalPrice: number;
    status: string;
    eventId: {
      title: string;
    };
  }>;
  stats: {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: number;
  };
}

export default function OrganizerDashboard({
  events,
  tickets,
  stats,
}: OrganizerDashboardProps) {
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to show updated events
        window.location.reload();
      } else {
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setDeletingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventStatus = (event: OrganizerDashboardProps["events"][0]) => {
    const eventDate = new Date(event.startDate);
    const now = new Date();

    if (eventDate < now) {
      return <Badge variant="secondary">Past</Badge>;
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return (
        <Badge variant="default" className="bg-orange-500">
          Tomorrow
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-500">
          Upcoming
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Icons.calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Icons.settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/events">View All Events</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/my-tickets">My Tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Events</CardTitle>
              <CardDescription>Manage and track your events</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/events/create">
                <Icons.plus className="w-4 h-4 mr-2" />
                New Event
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Icons.calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first event to get started
              </p>
              <Button asChild>
                <Link href="/events/create">Create Event</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">
                        <Link
                          href={`/events/${event.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {event.title}
                        </Link>
                      </h3>
                      {getEventStatus(event)}
                      <Badge variant="outline">
                        {event.categoryId?.name || "Uncategorized"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Icons.calendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatDate(event.startDate)} at{" "}
                          {formatTime(event.startTime)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Icons.mapPin className="w-4 h-4 mr-2" />
                        <span>
                          {event.isVirtual
                            ? "Virtual"
                            : event.venue
                            ? `${event.venue}, ${event.location}`
                            : event.location}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Icons.users className="w-4 h-4 mr-2" />
                        <span>
                          {
                            event.ticketTypes.reduce(
                              (sum, ticket) => sum + ticket.sold,
                              0
                            )
                          }{" "}
                          / {event.capacity} attendees
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.slug}`}>
                        <Icons.eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/edit/${event._id}`}>
                        <Icons.edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={deletingEventId === event._id}
                        >
                          {deletingEventId === event._id ? (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Icons.trash className="w-4 h-4 mr-2" />
                          )}
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel "{event.title}"? This
                            action will mark the event as cancelled and cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep event</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteEvent(event._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes, cancel event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {events.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Events ({events.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
