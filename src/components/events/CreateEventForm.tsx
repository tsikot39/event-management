"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/lib/validations/events";
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

const categories = [
  "Conference",
  "Workshop",
  "Seminar",
  "Networking",
  "Concert",
  "Festival",
  "Sports",
  "Education",
  "Technology",
  "Business",
  "Other",
];

export default function CreateEventForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      isVirtual: false,
      ticketPrice: 0,
      maxAttendees: 100,
    },
  });

  const watchIsVirtual = watch("isVirtual");

  const onSubmit = async (data: CreateEventInput) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to create event");
        return;
      }

      setSuccess("Event created successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/events/${result.event.slug}`);
      }, 2000);
    } catch (err) {
      console.error("Event creation error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Provide information about your event</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="Enter event title"
                {...register("title")}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                disabled={isLoading}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              rows={4}
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                disabled={isLoading}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                disabled={isLoading}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isVirtual"
              checked={watchIsVirtual}
              onCheckedChange={(checked) =>
                setValue("isVirtual", checked as boolean)
              }
              disabled={isLoading}
            />
            <Label htmlFor="isVirtual">This is a virtual event</Label>
          </div>

          {watchIsVirtual ? (
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Virtual Event Link</Label>
              <Input
                id="virtualLink"
                type="url"
                placeholder="https://zoom.us/j/..."
                {...register("virtualLink")}
                disabled={isLoading}
              />
              {errors.virtualLink && (
                <p className="text-sm text-red-600">
                  {errors.virtualLink.message}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  {...register("location")}
                  disabled={isLoading}
                />
                {errors.location && (
                  <p className="text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="Venue name or address"
                  {...register("venue")}
                  disabled={isLoading}
                />
                {errors.venue && (
                  <p className="text-sm text-red-600">{errors.venue.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Maximum Attendees</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                {...register("maxAttendees", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.maxAttendees && (
                <p className="text-sm text-red-600">
                  {errors.maxAttendees.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
              <Input
                id="ticketPrice"
                type="number"
                min="0"
                step="0.01"
                {...register("ticketPrice", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.ticketPrice && (
                <p className="text-sm text-red-600">
                  {errors.ticketPrice.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
