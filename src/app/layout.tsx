import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "EventHub - Discover & Create Amazing Events",
  description: "The premier event management platform. Discover amazing events, buy tickets instantly, or create and manage your own events with powerful tools.",
  keywords: ["events", "tickets", "event management", "platform", "organizer", "EventHub"],
  authors: [{ name: "EventHub Team" }],
  creator: "EventHub",
  publisher: "EventHub",
  applicationName: "EventHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon-16.svg" type="image/svg+xml" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
