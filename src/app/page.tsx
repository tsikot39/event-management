import { Suspense } from 'react';
import { EventList } from '@/components/events/event-list';
import { EventSearch } from '@/components/events/event-search';
import { EventFilters } from '@/components/events/event-filters';
import { Hero } from '@/components/layout/hero';
import { Navbar } from '@/components/layout/navbar';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 id="events" className="text-3xl font-bold mb-6 scroll-mt-20">Discover Events</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <Suspense fallback={<FiltersSkeleton />}>
                <EventFilters />
              </Suspense>
            </div>
            <div className="lg:w-3/4">
              <div className="mb-6">
                <Suspense fallback={<SearchSkeleton />}>
                  <EventSearch />
                </Suspense>
              </div>
              <Suspense fallback={<EventListSkeleton />}>
                <EventList />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
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
