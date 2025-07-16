import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { Event } from "@/lib/db/models";

interface LocationItem {
  id: string;
  label: string;
  type: "physical" | "virtual";
}

export async function GET() {
  try {
    await connectToDatabase();

    // Get unique locations from published events
    const locations = await Event.aggregate([
      {
        $match: {
          status: "published",
          $and: [
            { location: { $exists: true } },
            { location: { $ne: null } },
            { location: { $ne: "" } },
          ],
        },
      },
      {
        $group: {
          _id: null,
          locations: { $addToSet: "$location" },
          virtualEvents: {
            $sum: { $cond: [{ $eq: ["$isVirtual", true] }, 1, 0] },
          },
        },
      },
    ]);

    let locationList: LocationItem[] = [];

    if (locations.length > 0) {
      // Add physical locations
      const physicalLocations = locations[0].locations
        .filter((loc: string) => loc && loc.trim() !== "")
        .map((location: string) => ({
          id: location
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, ""),
          label: location,
          type: "physical" as const,
        }))
        .sort((a: LocationItem, b: LocationItem) =>
          a.label.localeCompare(b.label)
        );

      locationList = [...physicalLocations];

      // Add virtual option if there are virtual events
      if (locations[0].virtualEvents > 0) {
        locationList.unshift({
          id: "virtual",
          label: "Virtual/Online",
          type: "virtual" as const,
        });
      }
    }

    return NextResponse.json(locationList);
  } catch (error) {
    console.error("Locations fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
