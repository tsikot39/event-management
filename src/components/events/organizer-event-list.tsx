'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface TicketType {
  name: string;
  price: number;
  description?: string;
  quantity: number;
  sold: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue?: string;
  isVirtual: boolean;
  virtualLink?: string;
  capacity: number;
  ticketTypes: TicketType[];
  imageUrl?: string;
  status: 'draft' | 'published' | 'cancelled';
  slug: string;
  categoryId?: string;
  organizerId: string;
}

export function OrganizerEventList() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events/organizer');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [session]);

  if (loading) {
    return <OrganizerEventListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600">
          Create your first event using the &quot;Create Event&quot; button in the navigation bar above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate ticket statistics from ticketTypes
  const totalTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const soldTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
  const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

  // Get the primary ticket price (first ticket type)
  const primaryTicketPrice = event.ticketTypes[0]?.price || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="aspect-video relative bg-gray-100">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.startDate)} • {event.startTime} - {event.endTime}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {event.isVirtual ? 'Virtual Event' : event.location}
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {soldTickets}/{totalTickets} tickets sold ({soldPercentage.toFixed(0)}%)
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold">
            {primaryTicketPrice === 0 ? 'Free' : `$${primaryTicketPrice}`}
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event.slug}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/edit/${event._id}`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizerEventListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
