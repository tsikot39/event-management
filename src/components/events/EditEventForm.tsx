"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EditEventFormProps {
  event: {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    location: string;
    venue?: string;
    isVirtual: boolean;
    virtualLink?: string;
    capacity: number;
    imageUrl?: string;
    status: string;
    categoryId?: {
      _id: string;
      name: string;
    };
    tags?: string[];
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
      sold: number;
      description?: string;
    }>;
  };
  categories: Array<{
    _id: string;
    name: string;
  }>;
}

export default function EditEventForm({ event, categories }: EditEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    startDate: new Date(event.startDate).toISOString().split('T')[0],
    endDate: new Date(event.endDate).toISOString().split('T')[0],
    startTime: event.startTime || "09:00",
    endTime: event.endTime || "17:00",
    location: event.location,
    venue: event.venue || "",
    isVirtual: Boolean(event.isVirtual),
    virtualLink: event.virtualLink || "",
    capacity: Number(event.capacity),
    categoryId: event.categoryId?._id || "",
    imageUrl: event.imageUrl || "",
    status: event.status,
    ticketTypes: event.ticketTypes.map(ticket => ({
      name: ticket.name,
      price: Number(ticket.price),
      quantity: Number(ticket.quantity),
      description: ticket.description || "",
    })),
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/events/${event._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ticketTypes: formData.ticketTypes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to update event");
        return;
      }

      setSuccess("Event updated successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/events/${result.event.slug}`);
      }, 2000);
    } catch (err) {
      console.error("Event update error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
        <CardDescription>Update your event details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                disabled={isLoading}
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your event"
              rows={4}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isVirtual"
              checked={formData.isVirtual}
              onCheckedChange={(checked) => handleInputChange("isVirtual", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isVirtual" className="text-sm font-medium">
              This is a virtual event
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                {formData.isVirtual ? "Platform/Details" : "Location"}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder={
                  formData.isVirtual
                    ? "e.g., Zoom, Teams, or platform details"
                    : "Event location"
                }
                disabled={isLoading}
                required
              />
            </div>

            {!formData.isVirtual && (
              <div className="space-y-2">
                <Label htmlFor="venue">Venue (Optional)</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  placeholder="Specific venue name"
                  disabled={isLoading}
                />
              </div>
            )}

            {formData.isVirtual && (
              <div className="space-y-2">
                <Label htmlFor="virtualLink">Meeting Link (Optional)</Label>
                <Input
                  id="virtualLink"
                  value={formData.virtualLink}
                  onChange={(e) => handleInputChange("virtualLink", e.target.value)}
                  placeholder="https://..."
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 1)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                disabled={isLoading}
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Event Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              placeholder="https://..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Update Event
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
