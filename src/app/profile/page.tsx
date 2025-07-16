import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "@/components/layout/navbar";
import ProfileContent from "@/components/profile/ProfileContent";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account settings and profile information",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Ensure user data is properly typed for ProfileContent
  const userData = {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || "",
    role: session.user.role || "attendee",
    profilePicture: session.user.profilePicture,
    companyName: session.user.companyName,
    contactDetails: session.user.contactDetails,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account information and preferences
            </p>
          </div>
          
          <ProfileContent user={userData} />
        </div>
      </main>
    </div>
  );
}
