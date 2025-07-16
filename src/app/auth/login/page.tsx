import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import LoginForm from "@/components/auth/LoginForm";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | Event Management",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar hideAuth={true} />

      {/* Login Content - Takes remaining space and centers content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                create a new account
              </Link>
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
