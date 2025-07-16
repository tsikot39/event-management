import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { Event, Category } from "@/lib/db/models";
import { z } from "zod";

// Update event validation schema
const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  venue: z.string().optional(),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["draft", "published", "cancelled"]).default("draft"),
  ticketTypes: z.array(z.object({
    name: z.string().min(1, "Ticket name is required"),
    price: z.number().min(0, "Price must be 0 or greater"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    description: z.string().optional(),
  })).min(1, "At least one ticket type is required"),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/, '');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    console.log("Received update data:", JSON.stringify(body, null, 2));

    // Validate input
    const validatedData = updateEventSchema.parse(body);

    await connectToDatabase();

    // Check if event exists and user owns it
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Handle category
    let categoryData = null;
    if (validatedData.categoryId) {
      categoryData = await Category.findById(validatedData.categoryId);
      if (!categoryData) {
        // Create new category if it doesn't exist (for backwards compatibility)
        categoryData = await Category.create({
          name: validatedData.categoryId,
          description: "",
          status: "active",
        });
      }
    }

    // Generate new slug if title changed
    let slug = existingEvent.slug;
    if (validatedData.title !== existingEvent.title) {
      slug = slugify(validatedData.title);
      
      // Ensure slug is unique
      let slugCounter = 1;
      let uniqueSlug = slug;
      while (await Event.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
        uniqueSlug = `${slug}-${slugCounter}`;
        slugCounter++;
      }
      slug = uniqueSlug;
    }

    // Update event
    const updateData = {
      ...validatedData,
      slug,
      organizerId: session.user.id,
      categoryId: categoryData?._id,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      // Provide default time values if not specified
      startTime: validatedData.startTime && validatedData.startTime.trim() !== "" ? validatedData.startTime : "09:00",
      endTime: validatedData.endTime && validatedData.endTime.trim() !== "" ? validatedData.endTime : "17:00",
      updatedAt: new Date(),
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("organizerId", "name email")
      .populate("categoryId", "name description");

    return NextResponse.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Event update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid input data",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    // Check if event exists and user owns it
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (existingEvent.organizerId.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Instead of deleting, mark as cancelled for data integrity
    await Event.findByIdAndUpdate(id, { 
      status: "cancelled",
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Event cancelled successfully",
    });
  } catch (error) {
    console.error("Event deletion error:", error);

    return NextResponse.json(
      { message: "Failed to cancel event" },
      { status: 500 }
    );
  }
}
