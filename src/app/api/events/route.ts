import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createEventSchema } from "@/lib/validations/events";
import { Event, Category, Ticket } from "@/lib/db/models";
import { connectToDatabase } from "@/lib/db/connection";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "organizer") {
      return NextResponse.json(
        { message: "Only organizers can create events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Received create event data:", body);

    // Validate input
    let validatedData;
    try {
      validatedData = createEventSchema.parse(body);
      console.log("Validation successful:", validatedData);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { 
          message: "Validation failed", 
          errors: validationError instanceof Error ? validationError.message : "Unknown validation error"
        }, 
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate slug from category name first
    const categorySlug = validatedData.category
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Find or create category (check by both name and slug)
    let category = await Category.findOne({
      $or: [
        { name: validatedData.category.toLowerCase() },
        { slug: categorySlug }
      ]
    });

    if (!category) {
      try {
        category = new Category({
          name: validatedData.category.toLowerCase(),
          slug: categorySlug,
          description: `${validatedData.category} events`,
        });
        await category.save();
        console.log("Created new category:", category);
      } catch (categoryError) {
        console.error("Category creation error:", categoryError);
        // If category creation fails due to duplicate, try to find it again
        category = await Category.findOne({ slug: categorySlug });
        if (!category) {
          throw new Error("Failed to create or find category");
        }
      }
    }

    // Generate slug from event title
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create event
    const event = new Event({
      title: validatedData.title,
      description: validatedData.description,
      slug: slug,
      startDate: new Date(validatedData.date),
      endDate: new Date(validatedData.date), // For now, same as start date, you might want to calculate this
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      location: validatedData.isVirtual ? "Virtual" : validatedData.location,
      venue: validatedData.isVirtual ? "" : validatedData.venue,
      isVirtual: validatedData.isVirtual,
      virtualLink: validatedData.virtualLink || "",
      capacity: validatedData.maxAttendees,
      organizerId: session.user.id,
      categoryId: category._id,
      imageUrl: validatedData.images?.[0] || '',
      tags: validatedData.tags || [],
      ticketTypes: [
        {
          name: validatedData.ticketPrice === 0 ? "Free" : "General Admission",
          price: validatedData.ticketPrice,
          quantity: validatedData.maxAttendees,
          description:
            validatedData.ticketPrice === 0
              ? "Free admission"
              : "Standard ticket",
          sold: 0,
        },
      ],
    });

    await event.save();

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: {
          id: event._id,
          title: event.title,
          slug: event.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input data", errors: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const price = searchParams.get("price");
    const eventType = searchParams.get("eventType");
    const sort = searchParams.get("sort") || "date";

    const query: Record<string, unknown> = {
      status: 'published' // Only show published events in public listing
    };

    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') }, // Case-insensitive match
      });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Price filtering
    if (price) {
      switch (price) {
        case "free":
          query["ticketTypes.price"] = 0;
          break;
        case "under-50":
          query["ticketTypes.price"] = { $gt: 0, $lt: 50 };
          break;
        case "50-100":
          query["ticketTypes.price"] = { $gte: 50, $lte: 100 };
          break;
        case "over-100":
          query["ticketTypes.price"] = { $gt: 100 };
          break;
      }
    }

    // Event Type filtering (Virtual vs In-Person)
    if (eventType) {
      if (eventType === "virtual") {
        query.isVirtual = true;
      } else if (eventType === "in-person") {
        query.isVirtual = { $ne: true }; // Not virtual (either false or not set)
      }
    }

    const sortOptions: Record<string, 1 | -1> = {};
    switch (sort) {
      case "date":
        sortOptions.startDate = 1;
        break;
      case "price":
        sortOptions["ticketTypes.price"] = 1;
        break;
      case "popularity":
        sortOptions["ticketTypes.sold"] = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const events = await Event.find(query)
      .populate("organizerId", "name companyName")
      .populate("categoryId", "name")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Calculate real attendee counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        // Count tickets for this event (only completed payments and active tickets)
        const attendeeCount = await Ticket.countDocuments({
          eventId: event._id,
          paymentStatus: "completed",
          status: "active"
        });

        // Update the ticketTypes with real sold counts
        const eventObj = event.toObject();
        eventObj.ticketTypes = eventObj.ticketTypes.map((ticketType: { name: string; price: number; quantity: number; description?: string; sold?: number }) => ({
          ...ticketType,
          sold: attendeeCount // For simplicity, showing total sold across all ticket types
        }));

        return eventObj;
      })
    );

    const total = await Event.countDocuments(query);

    return NextResponse.json({
      events: eventsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
