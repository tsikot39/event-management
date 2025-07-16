"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TicketPurchaseDialog from "./TicketPurchaseDialog";

interface EventDetailsProps {
  event: {
    _id: string;
    title: string;
    description: string;
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
    imageUrl?: string;
    tags?: string[];
    organizerId?: {
      _id: string;
      name: string;
      companyName?: string;
      profilePicture?: string;
      contactDetails?: string;
    };
    categoryId?: {
      _id: string;
      name: string;
      description?: string;
    };
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
      sold: number;
      description?: string;
    }>;
  };
}

export default function EventDetails({ event }: EventDetailsProps) {
  const { data: session } = useSession();
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  const eventDate = new Date(event.startDate);
  const isEventPast = eventDate < new Date();
  const totalTickets = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  const soldTickets = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  const availableTickets = totalTickets - soldTickets;
  const isSoldOut = availableTickets <= 0;

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

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.images.length > 0 && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={event.images[0]}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Event Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{event.category.name}</Badge>
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Icons.calendar className="w-5 h-5 mr-2" />
                <span>{formatDate(eventDate)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Icons.clock className="w-5 h-5 mr-2" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Icons.mapPin className="w-5 h-5 mr-2" />
                <span>
                  {event.isVirtual
                    ? "Virtual Event"
                    : `${event.venue}, ${event.location}`}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Icons.users className="w-5 h-5 mr-2" />
                <span>
                  {event.attendeesCount} / {event.maxAttendees} attendees
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
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
                  {event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
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
                  <AlertDescription>This event is sold out.</AlertDescription>
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
                            ((event.maxAttendees - availableTickets) /
                              event.maxAttendees) *
                            100
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
                      {event.ticketPrice === 0
                        ? "Register for Free"
                        : "Buy Tickets"}
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
          <Card>
            <CardHeader>
              <CardTitle>Organized by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={event.organizer.profilePicture} />
                  <AvatarFallback>
                    {event.organizer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.organizer.name}</p>
                  {event.organizer.companyName && (
                    <p className="text-sm text-gray-600">
                      {event.organizer.companyName}
                    </p>
                  )}
                </div>
              </div>
              {event.organizer.contactDetails && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    {event.organizer.contactDetails}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
          event={event}
          isOpen={showTicketDialog}
          onClose={() => setShowTicketDialog(false)}
        />
      )}
    </div>
  );
}
