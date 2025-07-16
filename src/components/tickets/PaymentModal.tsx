import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  ticketAmount: number;
  isProcessing: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  ticketAmount,
  isProcessing,
}: PaymentModalProps) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === "cardNumber") {
      value = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
    }
    // Format expiry date
    if (field === "expiryDate") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/, "$1/");
    }
    // Only allow numbers for CVV
    if (field === "cvv") {
      value = value.replace(/\D/g, "");
    }

    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      cardData.cardNumber.replace(/\s/g, "").length === 16 &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length >= 3 &&
      cardData.cardholderName.trim().length > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid() && !isProcessing) {
      onPaymentComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.dollarSign className="w-5 h-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Enter your payment details to complete the purchase.
            <br />
            <span className="font-semibold">Total: ${ticketAmount.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardData.cardholderName}
              onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", e.target.value)}
              maxLength={19}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                maxLength={5}
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                maxLength={4}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <Icons.lock className="w-4 h-4 inline mr-1" />
              This is a demo payment form. No real charges will be made.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isProcessing}
              className="cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icons.dollarSign className="w-4 h-4 mr-2" />
                  Pay ${ticketAmount.toFixed(2)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
