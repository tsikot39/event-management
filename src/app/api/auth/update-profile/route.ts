import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { User } from "@/lib/db/models";
import { connectToDatabase } from "@/lib/db/connection";
import { updateProfileSchema } from "@/lib/validations/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateProfileSchema.parse(body);

    await connectToDatabase();

    // Get current user
    const currentUser = await User.findById(session.user.id);

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: validatedData.name,
        role: validatedData.role,
        profilePicture: validatedData.profilePicture || "",
        companyName: validatedData.companyName || "",
        contactDetails: validatedData.contactDetails || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          profilePicture: updatedUser.profilePicture,
          companyName: updatedUser.companyName,
          contactDetails: updatedUser.contactDetails,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);

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
