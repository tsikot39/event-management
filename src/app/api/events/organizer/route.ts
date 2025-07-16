import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { Event } from '@/lib/db/models/event';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'organizer') {
      return NextResponse.json(
        { message: 'Forbidden - Organizer access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Try to find events using both string and ObjectId formats
    const userIdString = session.user.id;
    const events = await Event.find({ 
      $or: [
        { organizerId: userIdString },
        { organizerId: userIdString }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Also try to find all events to see what's in the database
    const allEvents = await Event.find({}).lean();
    const allEventOrganizers = allEvents.map(e => ({ 
      id: e._id, 
      organizerId: e.organizerId, 
      title: e.title 
    }));

    return NextResponse.json({
      success: true,
      events,
      debug: {
        userId: session.user.id,
        userRole: session.user.role,
        eventsCount: events.length,
        query: { organizerId: session.user.id },
        allEventsInDb: allEvents.length,
        allEventOrganizers
      }
    });

  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
