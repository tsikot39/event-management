"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentModal from "./PaymentModal";

interface MyTicketsContentProps {
  tickets: Array<{
    _id: string;
    confirmationCode: string;
    quantity: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    purchaseDate: string;
    qrCode?: string;
    event: {
      _id: string;
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      venue: string;
      isVirtual: boolean;
      slug: string;
      organizerId: {
        name: string;
        companyName?: string;
      };
    };
  }>;
}

export default function MyTicketsContent({ tickets }: MyTicketsContentProps) {
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleOpenPaymentModal = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCompletePayment = async () => {
    if (!selectedTicket) return;
    
    setProcessingPayment(selectedTicket);
    
    try {
      const response = await fetch("/api/tickets/complete-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: selectedTicket }),
      });

      if (response.ok) {
        // Close modal and refresh the page to show updated payment status
        setPaymentModalOpen(false);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Payment failed: ${error.error}`);
      }
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(null);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-500">
            Confirmed
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-blue-500">
            Paid
          </Badge>
        );
      case "pending":
        return <Badge variant="outline">Payment Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Payment Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Icons.calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tickets yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven&apos;t purchased any tickets yet. Browse events to get
          started!
        </p>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.map((ticket) => {
        const eventDate = new Date(ticket.event.date);
        const isEventPast = eventDate < new Date();

        return (
          <Card key={ticket._id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/events/${ticket.event.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {ticket.event.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Organized by {ticket.event.organizerId.name}
                    {ticket.event.organizerId.companyName &&
                      ` • ${ticket.event.organizerId.companyName}`}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(ticket.status)}
                  {getPaymentStatusBadge(ticket.paymentStatus)}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Icons.calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(ticket.event.date)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Icons.clock className="w-4 h-4 mr-2" />
                  <span>
                    {formatTime(ticket.event.startTime)} -{" "}
                    {formatTime(ticket.event.endTime)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Icons.mapPin className="w-4 h-4 mr-2" />
                  <span>
                    {ticket.event.isVirtual
                      ? "Virtual Event"
                      : ticket.event.venue
                      ? `${ticket.event.venue}, ${ticket.event.location}`
                      : ticket.event.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4 text-sm">
                  <span>
                    <strong>Quantity:</strong> {ticket.quantity}
                  </span>
                  <span>
                    <strong>Total:</strong>{" "}
                    {ticket.totalAmount === 0
                      ? "Free"
                      : `$${ticket.totalAmount.toFixed(2)}`}
                  </span>
                  <span>
                    <strong>Confirmation:</strong> {ticket.confirmationCode}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {ticket.paymentStatus === "pending" && (
                    <Button 
                      variant="default" 
                      size="sm"
                      disabled={processingPayment === ticket._id}
                      onClick={() => handleOpenPaymentModal(ticket._id)}
                      className="cursor-pointer"
                    >
                      <Icons.dollarSign className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}

                  {ticket.status === "confirmed" && !isEventPast && (
                    <Button variant="outline" size="sm">
                      <Icons.download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${ticket.event.slug}`}>
                      <Icons.eye className="w-4 h-4 mr-2" />
                      View Event
                    </Link>
                  </Button>
                </div>
              </div>

              {ticket.paymentStatus === "pending" && (
                <Alert className="mt-4">
                  <Icons.dollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Payment is pending for this ticket. Click &quot;Complete Payment&quot; to finalize your purchase.
                  </AlertDescription>
                </Alert>
              )}

              {isEventPast && (
                <Alert className="mt-4">
                  <AlertDescription>
                    This event has already taken place.
                  </AlertDescription>
                </Alert>
              )}

              {ticket.status === "pending" && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Your ticket is pending confirmation. You will receive an
                    email once confirmed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        onPaymentComplete={handleCompletePayment}
        ticketAmount={selectedTicket ? tickets.find(t => t._id === selectedTicket)?.totalAmount || 0 : 0}
        isProcessing={processingPayment !== null}
      />
    </div>
  );
}
