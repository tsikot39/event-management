import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { EventList } from '@/components/events/event-list';
import { EventSearch } from '@/components/events/event-search';
import { EventFilters } from '@/components/events/event-filters';
import { OrganizerEventList } from '@/components/events/organizer-event-list';
import { Navbar } from '@/components/layout/navbar';
import { Skeleton } from '@/components/ui/skeleton';

export default async function EventsPage() {
  const session = await auth();
  const isOrganizer = session?.user?.role === 'organizer';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {isOrganizer ? 'My Events' : 'All Events'}
            </h1>
          </div>
          
          {isOrganizer ? (
            <Suspense fallback={<EventListSkeleton />}>
              <OrganizerEventList />
            </Suspense>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/4">
                <EventFilters />
              </div>
              <div className="lg:w-3/4">
                <div className="mb-6">
                  <EventSearch />
                </div>
                <Suspense fallback={<EventListSkeleton />}>
                  <EventList />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EventListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
