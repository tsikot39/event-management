"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { IEvent, ITicketType } from "@/lib/db/models/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import TicketPurchaseDialog from "./TicketPurchaseDialog";

interface EventDetailsProps {
  event: IEvent & {
    organizerId: {
      _id: string;
      name: string;
      email: string;
      profilePicture?: string;
      companyName?: string;
      contactDetails?: string;
    };
    categoryId?: {
      _id: string;
      name: string;
    };
  };
}

export default function EventDetails({ event }: EventDetailsProps) {
  const { data: session } = useSession();
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  const eventDate = new Date(event.startDate);
  const isEventPast = eventDate < new Date();
  const totalTickets = event.ticketTypes.reduce(
    (sum: number, type: ITicketType) => sum + type.quantity,
    0
  );
  const soldTickets = event.ticketTypes.reduce(
    (sum: number, type: ITicketType) => sum + type.sold,
    0
  );
  const availableTickets = totalTickets - soldTickets;
  const isSoldOut = availableTickets <= 0;
  const minPrice =
    event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t: ITicketType) => t.price))
      : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return "TBD";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAddress = () => {
    if (event.isVirtual) {
      return "Virtual Event";
    }
    if (event.venue && event.location) {
      return `${event.venue}, ${event.location}`;
    }
    return event.venue || event.location || "Location TBD";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Image */}
              {event.imageUrl && (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2">
                {event.categoryId && typeof event.categoryId === "object" && (
                  <Badge variant="secondary">{event.categoryId.name}</Badge>
                )}
                {event.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Event Title and Info */}
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-gray-900">
                  {event.title}
                </h1>

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Icons.calendar className="w-5 h-5 mr-3" />
                    <span>
                      {formatDate(eventDate)} at {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Icons.mapPin className="w-5 h-5 mr-3" />
                    <span>{formatAddress()}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Icons.users className="w-5 h-5 mr-3" />
                    <span>
                      {soldTickets} / {totalTickets} attendees
                    </span>
                  </div>
                </div>

                {/* Event Description */}
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-3">
                    About this event
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ticket Purchase Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Get Tickets</span>
                    <span className="text-2xl font-bold text-primary">
                      {minPrice === 0 ? "Free" : `$${minPrice}`}
                    </span>
                  </CardTitle>
                  {isEventPast && (
                    <Alert>
                      <AlertDescription>
                        This event has already passed.
                      </AlertDescription>
                    </Alert>
                  )}
                  {isSoldOut && !isEventPast && (
                    <Alert>
                      <AlertDescription>
                        This event is sold out.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                <CardContent>
                  {!isEventPast && !isSoldOut && (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {availableTickets} tickets remaining
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${
                                totalTickets > 0
                                  ? ((totalTickets - availableTickets) /
                                      totalTickets) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {session ? (
                        <Button
                          className="w-full"
                          onClick={() => setShowTicketDialog(true)}
                        >
                          {minPrice === 0 ? "Register for Free" : "Buy Tickets"}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button asChild className="w-full">
                            <Link href="/auth/login">Sign In to Purchase</Link>
                          </Button>
                          <p className="text-xs text-gray-500 text-center">
                            Don&apos;t have an account?{" "}
                            <Link
                              href="/auth/register"
                              className="text-primary hover:underline"
                            >
                              Sign up
                            </Link>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Organizer Info */}
              {event.organizerId && typeof event.organizerId === "object" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organized by</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={event.organizerId.profilePicture} />
                        <AvatarFallback>
                          {event.organizerId.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.organizerId.name}</p>
                        {event.organizerId.companyName && (
                          <p className="text-sm text-gray-600">
                            {event.organizerId.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                    {event.organizerId.contactDetails && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          {event.organizerId.contactDetails}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Share Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Share this event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon">
                      <Icons.share className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Icons.heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ticket Purchase Dialog */}
          {showTicketDialog && (
            <TicketPurchaseDialog
              event={{
                _id: event._id,
                title: event.title,
                ticketPrice: minPrice,
                maxAttendees: totalTickets,
                attendeesCount: soldTickets,
                ticketTypes: event.ticketTypes,
              }}
              isOpen={showTicketDialog}
              onClose={() => setShowTicketDialog(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
