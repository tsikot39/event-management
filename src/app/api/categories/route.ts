import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { Category } from "@/lib/db/models";

export async function GET() {
  try {
    await connectToDatabase();

    // Get all active categories
    const categories = await Category.find({ status: "active" })
      .sort({ name: 1 })
      .select("name description")
      .exec();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
