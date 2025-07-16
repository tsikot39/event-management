"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";

interface TicketPurchaseDialogProps {
  event: {
    _id: string;
    title: string;
    ticketPrice: number;
    maxAttendees: number;
    attendeesCount: number;
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
      description?: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketPurchaseDialog({
  event,
  isOpen,
  onClose,
}: TicketPurchaseDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableTickets = event.maxAttendees - event.attendeesCount;
  const totalPrice = event.ticketPrice * quantity;

  const handlePurchase = async () => {
    if (!session) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event._id,
          quantity,
          totalAmount: totalPrice,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Purchase failed");
        return;
      }

      setSuccess("Tickets purchased successfully!");

      // Redirect after a delay
      setTimeout(() => {
        onClose();
        router.push("/my-tickets");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("Purchase error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {event.ticketPrice === 0
              ? "Register for Event"
              : "Purchase Tickets"}
          </DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Tickets</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={Math.min(availableTickets, 10)}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              Maximum {Math.min(availableTickets, 10)} tickets per purchase
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span>Ticket Price:</span>
              <span>
                {event.ticketPrice === 0
                  ? "Free"
                  : `$${event.ticketPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
              <span>Total:</span>
              <span>
                {totalPrice === 0 ? "Free" : `$${totalPrice.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {event.ticketPrice === 0 ? "Register" : "Purchase"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
