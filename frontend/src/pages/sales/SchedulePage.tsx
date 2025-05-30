import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Home,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  timeSlot: string;
  description: string;
  type: "demo" | "meeting" | "follow-up";
}

// Mock events
const initialEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Product Demo with Acme Corp",
    date: addDays(new Date(), 2),
    timeSlot: "10:00 AM",
    description: "Walk through our product features and answer questions.",
    type: "demo",
  },
  {
    id: "evt-2",
    title: "Partnership Discussion with TechStart",
    date: addDays(new Date(), 4),
    timeSlot: "2:30 PM",
    description: "Explore potential partnership opportunities.",
    type: "meeting",
  },
  {
    id: "evt-3",
    title: "Follow-up Call with GlobalSystems",
    date: addDays(new Date(), 7),
    timeSlot: "11:15 AM",
    description: "Discuss pricing details and next steps.",
    type: "follow-up",
  },
];

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const eventTypes = [
  { value: "demo", label: "Product Demo" },
  { value: "meeting", label: "Meeting" },
  { value: "follow-up", label: "Follow-up Call" },
];

export function SchedulePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: new Date(),
    timeSlot: "10:00 AM",
    description: "",
    type: "meeting",
  });

  // Navigation
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  // Handle adding new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.timeSlot) return;

    const eventToAdd: CalendarEvent = {
      id: `evt-${events.length + 1}`,
      title: newEvent.title || "",
      date: newEvent.date || new Date(),
      timeSlot: newEvent.timeSlot || "10:00 AM",
      description: newEvent.description || "",
      type: (newEvent.type as "demo" | "meeting" | "follow-up") || "meeting",
    };

    setEvents([...events, eventToAdd]);
    setIsAddEventOpen(false);
    setNewEvent({
      title: "",
      date: new Date(),
      timeSlot: "10:00 AM",
      description: "",
      type: "meeting",
    });
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
    setSelectedEvent(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Schedule Meetings</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Organize and manage your sales meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left sidebar with month navigation and "Add Meeting" button */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Add Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule a New Meeting</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title || ""}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={
                          newEvent.date
                            ? format(newEvent.date, "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            date: e.target.value
                              ? new Date(e.target.value)
                              : new Date(),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={newEvent.timeSlot || "10:00 AM"}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, timeSlot: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select time" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={newEvent.type || "meeting"}
                        onValueChange={(value) =>
                          setNewEvent({
                            ...newEvent,
                            type: value as "demo" | "meeting" | "follow-up",
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newEvent.description || ""}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddEvent}
                    disabled={
                      !newEvent.title || !newEvent.date || !newEvent.timeSlot
                    }
                  >
                    Add Meeting
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Event count summary */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Upcoming</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total meetings</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This month</span>
                  <span className="font-medium">
                    {
                      events.filter((event) =>
                        isSameMonth(event.date, currentMonth)
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/sales")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Start
          </Button>
        </div>

        {/* Calendar grid */}
        <Card className="md:col-span-4 p-6">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-muted rounded-md overflow-hidden">
            {/* Offset for first day of month */}
            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-background min-h-[100px]" />
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "bg-background p-2 min-h-[100px] relative",
                    !isCurrentMonth && "opacity-50",
                    isToday(day) && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <div className="text-right mb-1">
                    <span
                      className={cn(
                        "inline-block rounded-full w-7 h-7 text-center leading-7 text-sm",
                        isToday(day) &&
                          "bg-primary text-primary-foreground font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          event.type === "demo" &&
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                          event.type === "meeting" &&
                            "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                          event.type === "follow-up" &&
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                        )}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center gap-1">
                          <span>{event.timeSlot}</span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Event details dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    selectedEvent.type === "demo" &&
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                    selectedEvent.type === "meeting" &&
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                    selectedEvent.type === "follow-up" &&
                      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                  )}
                >
                  {
                    eventTypes.find((t) => t.value === selectedEvent.type)
                      ?.label
                  }
                </Badge>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{format(selectedEvent.date, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.timeSlot}</span>
              </div>
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Cancel Meeting
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
