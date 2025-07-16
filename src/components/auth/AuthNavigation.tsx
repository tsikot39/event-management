"use client";

import Link from "next/link";
import { ArrowLeft, Home, Calendar } from "lucide-react";

export function AuthNavigation() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link
              href="/events"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
