"use client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = selectedDate.toDateString() === today.toDateString();
  const isYesterday = selectedDate.toDateString() === yesterday.toDateString();

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't allow future dates
    if (newDate <= today) {
      onDateChange(newDate);
    }
  };

  const canGoNext = selectedDate.toDateString() !== today.toDateString();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 h-10 px-4 font-medium"
      >
        <Calendar className="h-4 w-4" />
        {isToday
          ? "Today"
          : isYesterday
          ? "Yesterday"
          : formatDate(selectedDate)}
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 z-50 w-72 p-0 shadow-xl border-2 overflow-hidden">
          <div className=" p-1 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2 p-2">
                <Calendar className="h-4 w-4" />
                Select Date
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0 rounded-full hover:bg-white/50"
              >
                ×
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <Button
                variant={isToday ? "default" : "ghost"}
                size="sm"
                onClick={() => handleDateSelect(today)}
                className="w-full justify-start h-11 font-medium"
              >
                <div className="flex items-center justify-between w-full">
                  <span>Today</span>
                  <span className="text-xs opacity-70">
                    {formatDate(today)}
                  </span>
                </div>
              </Button>

              <Button
                variant={isYesterday ? "default" : "ghost"}
                size="sm"
                onClick={() => handleDateSelect(yesterday)}
                className="w-full justify-start h-11 font-medium"
              >
                <div className="flex items-center justify-between w-full">
                  <span>Yesterday</span>
                  <span className="text-xs opacity-70">
                    {formatDate(yesterday)}
                  </span>
                </div>
              </Button>
            </div>

            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground text-center mb-3 font-medium">
                {formatDate(selectedDate)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousDay}
                  className="flex-1 gap-1 h-9"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextDay}
                  disabled={!canGoNext}
                  className="flex-1 gap-1 h-9"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
