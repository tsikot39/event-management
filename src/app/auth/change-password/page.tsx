import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your account password",
};

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-2">
            Update your account password for security
          </p>
        </div>
        
        <ChangePasswordForm />
      </div>
    </div>
  );
}
