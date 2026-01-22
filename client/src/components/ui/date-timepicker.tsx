"use client";
 
import * as React from "react";
import { CalendarIcon } from "lucide-react"
import { format, isValid } from "date-fns";
 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePicker24hProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  resetTime?: string; // Format: "HH:mm" (e.g., "12:00")
  isCheckout?: boolean; // Flag to indicate if this is a checkout time picker
}
 
export function DateTimePicker24h({
  value,
  onChange,
  placeholder = "MM/DD/YYYY HH:mm",
  disabled = false,
  className,
}: DateTimePicker24hProps) {
  const [date, setDate] = React.useState<Date>();
  const [isOpen, setIsOpen] = React.useState(false);

  // Initialize from value prop
  React.useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    }
  }, [value]);
 
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // Preserve existing time if date already has time set
      if (date) {
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      } else {
        newDate.setHours(9, 30, 0, 0);
      }
      setDate(newDate);
      if (onChange) {
        onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  };
 
  const handleTimeChange = (
    type: "hour" | "minute",
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      }
      
      setDate(newDate);
      if (onChange) {
        onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  };
 
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-11 justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "MM/dd/yyyy HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={date && date.getHours() === hour ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}