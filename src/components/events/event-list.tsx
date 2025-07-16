'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold?: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  slug: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual?: boolean;
  capacity: number;
  ticketTypes: TicketType[];
  imageUrl?: string;
  status: 'draft' | 'published' | 'cancelled';
  organizerId: {
    _id: string;
    name?: string;
    companyName?: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function EventList() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters from URL search params
        const params = new URLSearchParams();
        params.set('limit', '20');
        params.set('sort', 'date');
        
        // Add search parameter if it exists
        const search = searchParams.get('search');
        if (search) {
          params.set('search', search);
        }
        
        // Add category parameter if it exists
        const category = searchParams.get('category');
        if (category && category !== 'all') {
          params.set('category', category);
        }
        
        // Add price parameter if it exists
        const price = searchParams.get('price');
        if (price) {
          params.set('price', price);
        }
        
        // Add event type parameter if it exists
        const eventType = searchParams.get('eventType');
        if (eventType) {
          params.set('eventType', eventType);
        }
        
        // Add sort parameter if it exists
        const sort = searchParams.get('sort');
        if (sort) {
          params.set('sort', sort);
        }
        
        const response = await fetch(`/api/events?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchParams]); // Re-fetch when search params change

  const getLowestPrice = (ticketTypes: TicketType[]) => {
    const prices = ticketTypes.map(ticket => ticket.price).filter(price => price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getTotalSold = (ticketTypes: TicketType[]) => {
    return ticketTypes.reduce((total, ticket) => total + (ticket.sold || 0), 0);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading events: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    const searchTerm = searchParams.get('search');
    const isSearching = !!searchTerm;
    
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">
          {isSearching ? 'No events found' : 'No events found'}
        </h3>
        <p className="text-gray-600">
          {isSearching 
            ? `No events match "${searchTerm}". Try different keywords or browse all events.`
            : 'Check back later for new events!'
          }
        </p>
      </div>
    );
  }

  const searchTerm = searchParams.get('search');
  const categoryFilter = searchParams.get('category');
  const priceFilter = searchParams.get('price');
  const locationFilter = searchParams.get('eventType');
  const isSearching = !!searchTerm;
  const hasFilters = !!(categoryFilter || priceFilter || locationFilter);
  const hasAnyFilters = isSearching || hasFilters;

  // Helper function to format price range labels
  const formatPriceLabel = (priceId: string) => {
    const priceLabels: Record<string, string> = {
      'free': 'Free',
      'under-50': 'Under $50',
      '50-100': '$50 - $100',
      'over-100': 'Over $100',
    };
    return priceLabels[priceId] || priceId;
  };

  // Helper function to format category labels
  const formatCategoryLabel = (categoryId: string) => {
    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  };

  // Helper function to format location labels
  const formatLocationLabel = (locationId: string) => {
    const locationLabels: Record<string, string> = {
      'virtual': '🌐 Virtual/Online',
      'in-person': '📍 In-Person',
    };
    return locationLabels[locationId] || locationId;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Results Header */}
      {hasAnyFilters && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {isSearching && (
                <span className="text-sm font-medium text-blue-900">
                  Search: &quot;{searchTerm}&quot;
                </span>
              )}
              {categoryFilter && (
                <span className="text-sm font-medium text-blue-900">
                  Category: {formatCategoryLabel(categoryFilter)}
                </span>
              )}
              {priceFilter && (
                <span className="text-sm font-medium text-blue-900">
                  Price: {formatPriceLabel(priceFilter)}
                </span>
              )}
              {locationFilter && (
                <span className="text-sm font-medium text-blue-900">
                  Event Type: {formatLocationLabel(locationFilter)}
                </span>
              )}
            </div>
            <p className="text-xs text-blue-700">
              Found {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/events'}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-20">
      {events.map((event) => {
        const lowestPrice = getLowestPrice(event.ticketTypes);
        const totalSold = getTotalSold(event.ticketTypes);
        const isFree = lowestPrice === 0;

        return (
          <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <Badge variant={isFree ? 'secondary' : 'default'}>
                  {isFree ? 'Free' : `From $${lowestPrice}`}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 ${
                    event.isVirtual 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  {event.isVirtual ? '🌐 Virtual' : '📍 In-Person'}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-white/90">
                  {totalSold}/{event.capacity} attending
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                  {event.title}
                </h3>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.startDate), 'MMM d')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(event.startDate), 'h:mm a')}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {event.description}
              </p>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                {event.isVirtual ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {event.isVirtual ? 'Online Event' : event.location}
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button asChild className="w-full">
                <Link href={`/events/${event.slug}`}>
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
